import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { confirmKashierPayment } from '../services/bookingService.js';

const isSuccessfulKashierCallback = (body) => {
  if (body.success === true) {
    return true;
  }

  if (typeof body.status === 'string' && body.status.toLowerCase() === 'successful') {
    return true;
  }

  if (typeof body.txn_response_code === 'string' && body.txn_response_code === 'APPROVED') {
    return true;
  }

  return false;
};

const extractBookingId = (body) => {
  return body.booking_id || body.merchant_order_id || body.order_id || body.order?.id || body.data?.booking_id;
};

const extractTransactionReference = (body) => {
  return body.transaction_reference || body.txn_id || body.transaction_id || body.order?.merchant_order_id || body.data?.transaction_reference;
};

export const kashierWebhook = asyncHandler(async (request, response) => {
  const bookingId = extractBookingId(request.body);

  if (!bookingId) {
    throw new AppError('booking_id is required', 400);
  }

  if (!isSuccessfulKashierCallback(request.body)) {
    return response.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  }

  const result = await confirmKashierPayment({
    bookingId,
    transactionReference: extractTransactionReference(request.body)
  });

  response.status(200).json({
    success: true,
    message: 'Payment confirmed',
    data: result
  });
});
