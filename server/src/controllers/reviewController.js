import { Review } from '../models/Review.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const uploadPhotos = async (files = []) => {
  if (!files.length) {
    return [];
  }

  const uploads = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, { folder: 'reviews', resourceType: 'image' }))
  );

  return uploads.map((item) => item.secure_url).filter(Boolean);
};

export const createReview = asyncHandler(async (request, response) => {
  const { unitId, title, description, rating } = request.body;
  const userId = request.user?.id || request.user?.userId || request.user?._id;

  if (!userId) {
    throw new AppError('Authentication payload missing user id', 401);
  }

  if (!unitId || !title || !description || !rating) {
    throw new AppError('unitId, title, description, and rating are required', 400);
  }

  const photos = await uploadPhotos(request.files || []);

  const review = await Review.create({
    user: userId,
    unit: unitId,
    title,
    description,
    rating: Number(rating),
    photos,
    status: 'visible'
  });

  response.status(201).json({
    success: true,
    data: review
  });
});

export const getUnitReviews = asyncHandler(async (request, response) => {
  const { unitId } = request.params;

  const reviews = await Review.find({ unit: unitId, status: 'visible' })
    .populate('user', 'name profile_photo')
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
    .populate('user', 'name profile_photo email')
    .populate('unit', 'title location unit_type photos status capacity')
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