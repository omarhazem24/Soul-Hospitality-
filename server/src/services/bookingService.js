import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import Unit from '../models/Unit.js';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

const HOLD_TTL_SECONDS = 900;
export const ACTIVE_BOOKING_STATUSES = ['temporary_hold', 'pending', 'approved', 'confirmed'];

const overlapFilter = (checkInDate, checkOutDate) => ({
  check_in_date: { $lt: checkOutDate },
  check_out_date: { $gt: checkInDate }
});

const toDate = (value, fieldName) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return parsedDate;
};

const calculateNights = (checkInDate, checkOutDate) => {
  const millisecondsPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerNight);
  if (nights <= 0) {
    throw new AppError('check_out_date must be after check_in_date', 400);
  }
  return nights;
};

export const createReservationHold = async ({
  userId,
  unitId,
  checkInDate,
  checkOutDate,
  guestCount,
  customer = {},
  financials = {},
  brokerCommission = {},
  isOwnerReservation = false,
  salesPerson = '',
  notes = '',
  transferProofUrl = '',
  paymentMethod,
  transactionReference
}) => {
  const session = await mongoose.startSession();
  let booking;
  let payment;

  try {
    booking = await session.withTransaction(async () => {
      const unit = await Unit.findOne({ _id: unitId, status: 'active' }).session(session);

      if (!unit) {
        throw new AppError('Unit not found or not available', 404);
      }

      const overlappingBooking = await Booking.findOne({
        unit: unitId,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        ...overlapFilter(checkInDate, checkOutDate)
      }).session(session);

      if (overlappingBooking) {
        throw new AppError('Unit is already booked for the selected dates', 409);
      }

      const nights = calculateNights(checkInDate, checkOutDate);
      const pricePerNight = Number(unit.pricePerNight || unit.price || 0);
      const totalAmount = nights * pricePerNight;
      const downPaymentCollected = Number(financials.downPaymentCollected || 0);
      const housekeepingFees = Number(financials.housekeepingFees || 0);
      const insurance = Number(financials.insurance || 0);
      const stillNeedToCollect = Math.max(0, totalAmount + housekeepingFees + insurance - downPaymentCollected);
      const bookingStatus = paymentMethod === 'kashier_card' ? 'temporary_hold' : 'pending';

      const createdBooking = await Booking.create(
        [
          {
            user: userId,
            customer,
            unit: unitId,
            unitId,
            dates: {
              checkIn: checkInDate,
              checkOut: checkOutDate
            },
            startDate: checkInDate,
            endDate: checkOutDate,
            guest_count: Number(guestCount),
            totalPrice: totalAmount,
            financials: {
              pricePerNight,
              totalAmount,
              downPaymentCollected,
              housekeepingFees,
              insurance,
              stillNeedToCollect,
              ownerCollectedPayment: Boolean(financials.ownerCollectedPayment)
            },
            brokerCommission: {
              isApplicable: Boolean(brokerCommission.isApplicable),
              brokerName: brokerCommission.brokerName || '',
              brokerAmountPerNight: Number(brokerCommission.brokerAmountPerNight || 0)
            },
            isOwnerReservation: Boolean(isOwnerReservation),
            salesPerson,
            notes,
            transferProofUrl,
            status: bookingStatus
          }
        ],
        { session }
      );

      const [bookingDocument] = createdBooking;

      await Payment.create(
        [
          {
            booking_id: bookingDocument._id,
            payment_method: paymentMethod,
            transaction_reference: transactionReference,
            amount: totalAmount,
            status: 'pending'
          }
        ],
        { session }
      );

      return bookingDocument;
    });

    const redisClient = getRedisClient();
    const redisKey = `booking:hold:${booking._id.toString()}`;
    await redisClient.set(redisKey, booking._id.toString(), {
      EX: HOLD_TTL_SECONDS
    });

    payment = await Payment.findOne({ booking_id: booking._id });

    return { booking, payment };
  } catch (error) {
    if (booking?._id) {
      await Booking.findByIdAndUpdate(booking._id, { status: 'cancelled' });
      await Payment.updateOne({ booking_id: booking._id }, { status: 'failed' });
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const confirmKashierPayment = async ({ bookingId, transactionReference }) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      const payment = await Payment.findOne({ booking_id: booking._id }).session(session);

      if (!payment) {
        throw new AppError('Payment record not found', 404);
      }

      await Payment.updateOne(
        { _id: payment._id },
        {
          status: 'successful',
          transaction_reference: transactionReference ?? payment.transaction_reference,
          paid_at: new Date()
        },
        { session }
      );

      await Booking.updateOne(
        { _id: booking._id },
        { status: 'confirmed' },
        { session }
      );

      return { bookingId: booking._id.toString(), paymentId: payment._id.toString() };
    });
  } finally {
    session.endSession();
  }
};

export const cancelExpiredHoldIfUnpaid = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking || booking.status !== 'temporary_hold') {
    return null;
  }

  const payment = await Payment.findOne({ booking_id: booking._id });

  if (payment?.status === 'successful') {
    return booking;
  }

  await Booking.updateOne({ _id: booking._id }, { status: 'cancelled' });

  if (payment && payment.status !== 'successful') {
    await Payment.updateOne({ _id: payment._id }, { status: 'failed' });
  }

  const redisClient = getRedisClient();
  await redisClient.del(`booking:hold:${booking._id.toString()}`);

  return booking;
};

export const normalizeBookingRequest = (body) => {
  const checkInDate = toDate(body.check_in_date, 'check_in_date');
  const checkOutDate = toDate(body.check_out_date, 'check_out_date');

  return {
    userId: body.user_id,
    unitId: body.unit_id,
    checkInDate,
    checkOutDate,
    guestCount: Number(body.guest_count),
    customer: {
      name: body.customer?.name || body.customer_name || '',
      email: body.customer?.email || body.customer_email || '',
      phone: body.customer?.phone || body.customer_phone || '',
      nationality: body.customer?.nationality || body.customer_nationality || ''
    },
    financials: {
      downPaymentCollected: Number(body.down_payment_collected || 0),
      housekeepingFees: Number(body.housekeeping_fees || 0),
      insurance: Number(body.insurance || 0),
      ownerCollectedPayment: String(body.owner_collected_payment || '').toLowerCase() === 'true'
    },
    brokerCommission: {
      isApplicable: String(body.broker_commission || '').toLowerCase() === 'true',
      brokerName: body.broker_name || '',
      brokerAmountPerNight: Number(body.broker_amount_per_night || 0)
    },
    isOwnerReservation: String(body.is_owner_reservation || '').toLowerCase() === 'true',
    salesPerson: body.sales_person || '',
    notes: body.notes || '',
    transferProofUrl: body.transfer_proof_url || '',
    paymentMethod: body.payment_method,
    transactionReference: body.transaction_reference
  };
};
