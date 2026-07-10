import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { confirmKashierPayment, finalizeCardCheckoutFromWebhook } from '../services/bookingService.js';

const safeCompare = (a, b) => {
  const first = Buffer.from(String(a || ''), 'utf8');
  const second = Buffer.from(String(b || ''), 'utf8');

  if (!first.length || first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
};

const extractMerchantOrderId = (body = {}) => {
  return (
    body?.merchantOrderId ||
    body?.merchant_order_id ||
    body?.order_id ||
    body?.data?.merchantOrderId ||
    body?.data?.merchant_order_id ||
    body?.order?.merchantOrderId ||
    body?.order?.merchant_order_id ||
    ''
  );
};

const extractBookingId = (body = {}) => {
  return (
    body?.booking_id ||
    body?.bookingId ||
    body?.data?.booking_id ||
    body?.data?.bookingId ||
    body?.order?.id ||
    ''
  );
};

const extractStatus = (body = {}) => {
  const statusCandidates = [
    body?.data?.status,
    body?.status,
    body?.payment_status,
    body?.order?.status,
    body?.event
  ];

  const normalized = statusCandidates
    .map((item) => String(item || '').trim())
    .find(Boolean) || '';

  if (normalized === 'transaction.success') {
    return 'SUCCESS';
  }

  return normalized.toUpperCase();
};

const extractTransactionReference = (body = {}) => {
  return (
    body?.transaction_reference ||
    body?.transactionReference ||
    body?.txn_id ||
    body?.transaction_id ||
    body?.data?.transaction_reference ||
    body?.data?.transactionReference ||
    body?.data?.id ||
    body?.id ||
    ''
  );
};

const extractProvidedSignature = (request) => {
  const headerSignature = request.headers['x-kashier-signature'] || request.headers['x-signature'] || request.headers['x-webhook-signature'];
  const bodySignature = request.body?.signature || request.body?.hash || request.body?.data?.signature || request.body?.data?.hash;

  return String(headerSignature || bodySignature || '').trim();
};

const verifyKashierWebhookSignature = (request) => {
  const webhookSecret = String(process.env.KASHIER_WEBHOOK_SECRET || '').trim();
  const providedSignature = extractProvidedSignature(request);

  if (!webhookSecret) {
    throw new AppError('KASHIER_WEBHOOK_SECRET is required for webhook verification', 500);
  }

  if (!providedSignature) {
    return false;
  }

  const rawPayload = String(request.rawBody || JSON.stringify(request.body || {}));
  const hmacRaw = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');
  const normalizedBody = JSON.stringify(request.body || {});
  const hmacNormalized = crypto.createHmac('sha256', webhookSecret).update(normalizedBody).digest('hex');

  const merchantOrderId = extractMerchantOrderId(request.body);
  const status = extractStatus(request.body);
  const amount = Number(request.body?.data?.amount ?? request.body?.amount ?? 0);
  const canonical = `${merchantOrderId}|${status}|${amount}`;
  const hmacCanonical = crypto.createHmac('sha256', webhookSecret).update(canonical).digest('hex');

  return [hmacRaw, hmacNormalized, hmacCanonical].some((expected) => safeCompare(expected, providedSignature));
};

export const kashierWebhook = asyncHandler(async (request, response) => {
  const signatureIsValid = verifyKashierWebhookSignature(request);
  if (!signatureIsValid) {
    return response.status(401).json({
      success: false,
      message: 'Invalid webhook signature'
    });
  }

  const status = extractStatus(request.body);
  if (status !== 'SUCCESS') {
    return response.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  }

  const merchantOrderId = extractMerchantOrderId(request.body);
  const transactionReference = extractTransactionReference(request.body) || merchantOrderId;

  if (transactionReference) {
    const existingPayment = await Payment.findOne({ transaction_reference: transactionReference }).select('_id booking_id').lean();
    if (existingPayment) {
      return response.status(200).json({
        success: true,
        received: true,
        duplicate: true,
        data: {
          bookingId: existingPayment.booking_id || null
        }
      });
    }
  }

  if (!merchantOrderId) {
    throw new AppError('merchantOrderId is required', 400);
  }

  if (merchantOrderId.startsWith('TEMP_SOUL_')) {
    const finalized = await finalizeCardCheckoutFromWebhook({
      merchantOrderId,
      transactionReference
    });

    return response.status(200).json({
      success: true,
      received: true,
      data: finalized
    });
  }

  const legacyBookingId = extractBookingId(request.body) || merchantOrderId;
  const result = await confirmKashierPayment({
    bookingId: legacyBookingId,
    transactionReference
  });

  response.status(200).json({
    success: true,
    message: 'Payment confirmed',
    data: result
  });
});
