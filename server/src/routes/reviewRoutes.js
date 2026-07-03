import { Router } from 'express';
import { createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadReviewPhotos } from '../middleware/uploadMiddleware.js';

const reviewRouter = Router();

reviewRouter.post('/', protect, uploadReviewPhotos.array('photos', 4), createReview);

export { reviewRouter };