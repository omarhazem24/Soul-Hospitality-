import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { createReservationHold, normalizeBookingRequest } from '../services/bookingService.js';

export const createBookingHold = asyncHandler(async (request, response) => {
  const bookingPayload = normalizeBookingRequest(request.body);

  if (!bookingPayload.userId || !bookingPayload.unitId || !bookingPayload.paymentMethod) {
    throw new AppError('user_id, unit_id, and payment_method are required', 400);
  }

  const result = await createReservationHold(bookingPayload);

  response.status(201).json({
    success: true,
    booking: result.booking,
    payment: result.payment
  });
});
