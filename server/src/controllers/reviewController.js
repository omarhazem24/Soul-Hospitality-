import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReview = asyncHandler(async (request, response) => {
  const routeUnitId = request.params.unitId;
  const { unitId: bodyUnitId, guestName, rating, comment } = request.body;
  const unitId = routeUnitId || bodyUnitId;
  const userId = request.user?.id || request.user?.userId || request.user?._id;
  const displayName = String(guestName || request.user?.name || 'Guest').trim();

  if (!userId) {
    throw new AppError('Authentication payload missing user id', 401);
  }

  if (!unitId || !rating || !comment) {
    throw new AppError('unitId, rating, and comment are required', 400);
  }

  const review = await Review.create({
    userId: userId,
    unitId,
    guestName: displayName,
    rating: Number(rating),
    comment,
    status: 'visible'
  });

  response.status(201).json({
    success: true,
    data: review
  });
});

export const getUnitReviews = asyncHandler(async (request, response) => {
  const { unitId } = request.params;

  const reviews = await Review.find({ unitId, status: 'visible' })
    .populate('userId', 'name profile_photo')
    .sort({ createdAt: -1 });

  response.json({
    success: true,
    data: reviews
  });
});

const parseSortOption = (sortOption = 'createdAt_desc') => {
  const mappings = {
    createdAt_desc: { createdAt: -1 },
    createdAt_asc: { createdAt: 1 },
    rating_desc: { rating: -1 },
    rating_asc: { rating: 1 }
  };

  return mappings[sortOption] || mappings.createdAt_desc;
};

export const listAllReviews = asyncHandler(async (request, response) => {
  const reviews = await Review.find()
    .populate('userId', 'name profile_photo email')
    .populate('unitId', 'title location unit_type photos status capacity')
    .sort(parseSortOption(request.query.sort));

  response.json({
    success: true,
    data: reviews
  });
});

export const hideReview = asyncHandler(async (request, response) => {
  const review = await Review.findById(request.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  review.status = 'hidden';
  await review.save();

  response.json({
    success: true,
    message: 'Review hidden'
  });
});