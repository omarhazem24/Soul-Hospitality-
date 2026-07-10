import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createReservationHold, normalizeBookingRequest } from '../services/bookingService.js';
import { applyBookingCommissionSnapshot } from '../utils/bookingCommission.js';

export const listBookingRequests = asyncHandler(async (request, response) => {
  const filter = {};

  if (request.query.status) {
    const statuses = String(request.query.status)
      .split(',')
      .map((status) => status.trim())
      .filter(Boolean);

    filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email phone_number profile_photo role')
    .populate('unit', 'title location unit_type price capacity photos status')
    .sort({ createdAt: -1 });

  response.json({
    success: true,
    data: bookings
  });
});

export const createAdminBooking = asyncHandler(async (request, response) => {
  const bookingPayload = normalizeBookingRequest({
    ...request.body,
    is_admin_created: 'true'
  });

  if (!bookingPayload.unitId || !bookingPayload.checkInDate || !bookingPayload.checkOutDate) {
    throw new AppError('unit_id, check_in_date, and check_out_date are required', 400);
  }

  const result = await createReservationHold({
    ...bookingPayload,
    userId: request.user?.id,
    paymentMethod: request.body.payment_method || 'cash',
    isAdminCreated: true
  });

  response.status(201).json({
    success: true,
    data: result
  });
});

export const updateBookingRequestStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = ['Pending', 'Accepted', 'Rejected'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError('status must be Pending, Accepted, or Rejected', 400);
  }

  const session = await mongoose.startSession();

  const persistStatusUpdate = async (activeSession = null) => {
    const maybeSession = (query) => (activeSession ? query.session(activeSession) : query);

    const booking = await maybeSession(Booking.findById(request.params.id));

    if (!booking) {
      throw new AppError('Booking request not found', 404);
    }

    booking.status = status;
    booking.holdExpiresAt = status === 'Pending' ? booking.holdExpiresAt : null;
    applyBookingCommissionSnapshot(booking, status === 'Accepted' ? new Date() : null);

    if (activeSession) {
      await booking.save({ session: activeSession });
      if (status === 'Rejected') {
        await Payment.updateOne({ booking_id: booking._id }, { status: 'failed' }, { session: activeSession });
      }
    } else {
      await booking.save();
      if (status === 'Rejected') {
        await Payment.updateOne({ booking_id: booking._id }, { status: 'failed' });
      }
    }

    return booking;
  };

  try {
    let updatedBooking;
    try {
      updatedBooking = await session.withTransaction(async () => persistStatusUpdate(session));
    } catch (error) {
      if (String(error?.message || '').includes('Transaction numbers are only allowed')) {
        updatedBooking = await persistStatusUpdate(null);
      } else {
        throw error;
      }
    }

    if (status === 'Rejected') {
      await Booking.updateOne({ _id: updatedBooking._id }, { holdExpiresAt: null });
    }

    response.json({
      success: true,
      data: updatedBooking
    });
  } finally {
    session.endSession();
  }
});

export const deleteBookingRequest = asyncHandler(async (request, response) => {
  const booking = await Booking.findById(request.params.id);

  if (!booking) {
    throw new AppError('Booking request not found', 404);
  }

  await Payment.deleteOne({ booking_id: booking._id });
  await Booking.deleteOne({ _id: booking._id });

  response.json({
    success: true,
    message: 'Reservation deleted successfully'
  });
});
