import { PromoCode } from '../models/PromoCode.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const normalizeCode = (value) => String(value || '').trim().toUpperCase();

export const getPromoCodes = asyncHandler(async (request, response) => {
  const promoCodes = await PromoCode.find().sort({ createdAt: -1 }).lean();

  response.json({
    success: true,
    data: promoCodes
  });
});

export const createPromoCode = asyncHandler(async (request, response) => {
  const code = normalizeCode(request.body.code);
  const percentage = Number(request.body.percentage);

  if (!code || !percentage) {
    throw new AppError('code and percentage are required', 400);
  }

  const existingPromoCode = await PromoCode.findOne({ code });

  if (existingPromoCode) {
    throw new AppError('Promo code already exists', 409);
  }

  const promoCode = await PromoCode.create({
    code,
    percentage,
    active: true
  });

  response.status(201).json({
    success: true,
    data: promoCode
  });
});

export const deletePromoCode = asyncHandler(async (request, response) => {
  const promoCode = await PromoCode.findById(request.params.id);

  if (!promoCode) {
    throw new AppError('Promo code not found', 404);
  }

  await PromoCode.deleteOne({ _id: promoCode._id });

  response.json({
    success: true,
    message: 'Promo code deleted'
  });
});

export const validatePromoCode = asyncHandler(async (request, response) => {
  const code = normalizeCode(request.body.code);
  const userId = request.user?.id || request.user?.userId || request.user?._id;

  if (!code || !userId) {
    throw new AppError('code is required', 400);
  }

  const promoCode = await PromoCode.findOne({ code, active: true }).lean();

  if (!promoCode) {
    throw new AppError('Invalid or inactive promo code', 404);
  }

  const alreadyUsed = Array.isArray(promoCode.usedByUsers)
    && promoCode.usedByUsers.some((item) => String(item) === String(userId));

  if (alreadyUsed) {
    throw new AppError('Promo code already used by this customer', 409);
  }

  response.json({
    success: true,
    data: {
      code: promoCode.code,
      percentage: promoCode.percentage
    }
  });
});