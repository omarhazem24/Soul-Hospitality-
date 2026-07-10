import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
  createCardCheckoutSession,
  createReservationHold,
  markCardCheckoutGatewayFailed,
  markCardCheckoutGatewayRequested,
  normalizeBookingRequest
} from '../services/bookingService.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const uploadPhotoWithRetry = async (file, maxAttempts = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const upload = await uploadBufferToCloudinary(file.buffer, {
        folder: 'booking-id-photos',
        resourceType: 'image'
      });

      if (upload?.secure_url) {
        return upload.secure_url;
      }

      throw new Error('Cloudinary upload returned no secure_url');
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(250 * attempt);
      }
    }
  }

  throw lastError;
};

const uploadIdentityPhotos = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const successfulUploads = [];

  for (const file of files) {
    try {
      const url = await uploadPhotoWithRetry(file, 3);
      successfulUploads.push(url);
    } catch (error) {
      console.error('Booking ID photo upload failed:', error?.message || error);
    }
  }

  if (!successfulUploads.length) {
    throw new AppError('Unable to upload a photo now. Please try again shortly.', 503);
  }

  return successfulUploads;
};

const normalizePaymentMethodAlias = (method) => {
  const normalized = String(method || '').trim().toLowerCase();
  if (normalized === 'card') {
    return 'kashier_card';
  }

  return normalized;
};

const isValidAbsoluteUrl = (value) => {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isPublicHttpUrl = (value) => {
  if (!isValidAbsoluteUrl(value)) {
    return false;
  }

  const parsed = new URL(String(value || ''));
  const hostname = String(parsed.hostname || '').trim().toLowerCase();

  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return false;
  }

  return true;
};

const initializeKashierPayment = async ({ merchantOrderId, amount, callbackUrl }) => {
  const endpoint = process.env.KASHIER_PAYMENT_SESSION_URL || 'https://api.kashier.io/v3/payment/sessions';
  const merchantId = process.env.KASHIER_MERCHANT_ID || '';
  const secretKey = process.env.KASHIER_SECRET_KEY || '';
  const apiKey = process.env.KASHIER_API_KEY || '';
  const frontendBaseUrl = process.env.FRONTEND_URL || '';
  const backendBaseUrl = process.env.BACKEND_PUBLIC_URL || '';
  const mode = String(process.env.KASHIER_MODE || 'live').trim().toLowerCase() === 'test' ? 'test' : 'live';

  if (!merchantId || !secretKey || !apiKey) {
    throw new AppError('Kashier gateway is not configured (missing merchant credentials or api key).', 500);
  }

  const requestedCallback = String(callbackUrl || '').trim();
  const fallbackCallback = frontendBaseUrl ? `${frontendBaseUrl.replace(/\/$/, '')}/checkout/payment/callback?status=success` : '';
  const resolvedCallback = isPublicHttpUrl(requestedCallback) ? requestedCallback : fallbackCallback;
  const webhookUrl = isPublicHttpUrl(backendBaseUrl) ? `${backendBaseUrl.replace(/\/$/, '')}/api/payments/kashier-webhook` : '';

  if (!isPublicHttpUrl(resolvedCallback)) {
    throw new AppError('Kashier card checkout requires FRONTEND_URL to be a public https/http URL. localhost callback URLs are rejected by Kashier.', 500);
  }

  if (!webhookUrl) {
    throw new AppError('Kashier card checkout requires BACKEND_PUBLIC_URL to be a public https/http URL so Kashier can reach the webhook endpoint.', 500);
  }

  const expireAt = new Date(Date.now() + (30 * 60 * 1000)).toISOString();
  const payload = {
    expireAt,
    maxFailureAttempts: 3,
    paymentType: 'credit',
    amount: Number(amount || 0).toFixed(2),
    currency: 'EGP',
    orderId: merchantOrderId,
    merchantOrderId,
    merchantId,
    mode,
    type: 'external',
    allowedMethods: 'card',
    redirectMethod: 'get',
    display: 'en',
    merchantRedirect: resolvedCallback,
    ...(webhookUrl ? { serverWebhook: webhookUrl } : {}),
    metaData: encodeURIComponent(JSON.stringify({
      merchantOrderId,
      paymentMethod: 'kashier_card'
    }))
  };

  const gatewayResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: secretKey,
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseText = await gatewayResponse.text();
  let responseJson = {};

  try {
    responseJson = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseJson = {};
  }

  if (!gatewayResponse.ok) {
    const reason = responseJson?.message || responseText || `HTTP ${gatewayResponse.status}`;
    throw new AppError(`Kashier gateway request failed: ${reason}`, 500);
  }

  const paymentUrl = responseJson?.sessionUrl || responseJson?.data?.sessionUrl || responseJson?.response?.paymentUrl || responseJson?.paymentUrl || '';
  if (!paymentUrl) {
    throw new AppError('Kashier response did not include a payment URL.', 500);
  }

  return {
    paymentUrl,
    merchantOrderId
  };
};

export const createBookingHold = asyncHandler(async (request, res) => {
  const bookingPayload = normalizeBookingRequest(request.body);
  const resolvedPaymentMethod = normalizePaymentMethodAlias(bookingPayload.paymentMethod);
  bookingPayload.paymentMethod = resolvedPaymentMethod;
  const authUserId = request.user?.id || request.user?.userId || request.user?._id;
  const idPhotos = await uploadIdentityPhotos(request.files || []);

  if (!authUserId || !bookingPayload.unitId || !bookingPayload.paymentMethod) {
    throw new AppError('user_id, unit_id, and payment_method are required', 400);
  }

  if (!bookingPayload.checkInDate || !bookingPayload.checkOutDate) {
    throw new AppError('check_in_date and check_out_date are required', 400);
  }

  if (!Number.isFinite(Number(bookingPayload.guestCount)) || Number(bookingPayload.guestCount) < 1) {
    throw new AppError('guest_count must be at least 1', 400);
  }

  if (!String(bookingPayload.customer?.name || '').trim()) {
    throw new AppError('customer_name is required', 400);
  }

  if (!String(bookingPayload.customer?.phone || '').trim()) {
    throw new AppError('customer_phone is required', 400);
  }

  if (!String(bookingPayload.customer?.email || '').trim()) {
    throw new AppError('customer_email is required', 400);
  }

  if (!idPhotos.length) {
    throw new AppError('At least one ID or passport photo is required', 400);
  }

  if (resolvedPaymentMethod === 'kashier_card') {
    const callbackUrl = String(request.body.callback_url || request.body.callbackUrl || '').trim();
    const cardSession = await createCardCheckoutSession({
      ...bookingPayload,
      userId: authUserId,
      idPhotos,
      promoCode: request.body.promo_code || request.body.promoCode || '',
      transferEvidencePhoto: request.body.transfer_evidence_photo || request.body.transferEvidencePhoto || '',
      callbackUrl
    });

    try {
      const gateway = await initializeKashierPayment({
        merchantOrderId: cardSession.session.merchantOrderId,
        amount: cardSession.amount,
        callbackUrl
      });

      await markCardCheckoutGatewayRequested({
        merchantOrderId: cardSession.session.merchantOrderId,
        paymentUrl: gateway.paymentUrl,
        gatewayResponse: {
          paymentUrl: gateway.paymentUrl,
          merchantOrderId: gateway.merchantOrderId
        }
      });

      res.status(201).json({
        success: true,
        redirectToKashier: true,
        paymentUrl: gateway.paymentUrl,
        data: {
          merchantOrderId: cardSession.session.merchantOrderId,
          payment: {
            payment_method: 'kashier_card',
            amount: cardSession.amount,
            checkoutUrl: gateway.paymentUrl
          }
        }
      });
      return;
    } catch (gatewayError) {
      console.error('Kashier Gateway Failure:', gatewayError?.message || gatewayError);
      await markCardCheckoutGatewayFailed({
        merchantOrderId: cardSession.session.merchantOrderId,
        errorMessage: gatewayError?.message || 'Kashier request failed'
      });

      res.status(gatewayError?.statusCode || 500).json({
        success: false,
        message: 'Unable to initialize card payment gateway.',
        data: {
          merchantOrderId: cardSession.session.merchantOrderId
        }
      });
      return;
    }
  }

  const result = await createReservationHold({
    ...bookingPayload,
    userId: authUserId,
    idPhotos,
    promoCode: request.body.promo_code || request.body.promoCode || '',
    transferEvidencePhoto: request.body.transfer_evidence_photo || request.body.transferEvidencePhoto || ''
  });

  const paymentData = result.payment?.toObject ? result.payment.toObject() : result.payment;

  res.status(201).json({
    success: true,
    data: {
      booking: result.booking,
      payment: paymentData
    }
  });
});
