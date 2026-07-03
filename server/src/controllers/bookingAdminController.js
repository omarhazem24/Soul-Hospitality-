import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRedisClient } from '../config/redis.js';
import { createReservationHold, normalizeBookingRequest } from '../services/bookingService.js';

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
  const bookingPayload = normalizeBookingRequest(request.body);

  if (!bookingPayload.unitId || !bookingPayload.checkInDate || !bookingPayload.checkOutDate) {
    throw new AppError('unit_id, check_in_date, and check_out_date are required', 400);
  }

  const result = await createReservationHold({
    ...bookingPayload,
    userId: request.user?.id,
    paymentMethod: request.body.payment_method || 'cash'
  });

  response.status(201).json({
    success: true,
    data: result
  });
});

export const updateBookingRequestStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const allowedStatuses = ['approved', 'rejected'];

  if (!allowedStatuses.includes(status)) {
    throw new AppError('status must be approved or rejected', 400);
  }

  const session = await mongoose.startSession();

  try {
    const updatedBooking = await session.withTransaction(async () => {
      const booking = await Booking.findById(request.params.id).session(session);

      if (!booking) {
        throw new AppError('Booking request not found', 404);
      }

      const nextStatus = status;
      booking.status = nextStatus;
      await booking.save({ session });

      if (nextStatus === 'rejected') {
        await Payment.updateOne({ booking_id: booking._id }, { status: 'failed' }, { session });
      }

      return booking;
    });

    if (status === 'rejected') {
      await getRedisClient().del(`booking:hold:${updatedBooking._id.toString()}`);
    }

    response.json({
      success: true,
      data: updatedBooking
    });
  } finally {
    session.endSession();
  }
});
