import { HeroSlideshow } from '../models/HeroSlideshow.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

export const listSlideshows = asyncHandler(async (request, response) => {
  const slides = await HeroSlideshow.find().sort({ order: 1, createdAt: 1 });

  response.json({
    success: true,
    data: slides
  });
});

export const createSlideshow = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new AppError('An image is required', 400);
  }

  const uploadResult = await uploadBufferToCloudinary(request.file.buffer, {
    folder: 'slideshow',
    resourceType: 'image'
  });

  const slide = await HeroSlideshow.create({
    imageUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    order: Number(request.body.order || 0),
    caption: request.body.caption || ''
  });

  response.status(201).json({
    success: true,
    data: slide
  });
});

export const deleteSlideshow = asyncHandler(async (request, response) => {
  const slide = await HeroSlideshow.findById(request.params.id);

  if (!slide) {
    throw new AppError('Slideshow item not found', 404);
  }

  await deleteFromCloudinary(slide.publicId, 'image');
  await slide.deleteOne();

  response.json({
    success: true,
    message: 'Slideshow item deleted'
  });
});
