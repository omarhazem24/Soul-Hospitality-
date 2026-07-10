import { Router } from 'express';
import { createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const reviewRouter = Router();

reviewRouter.post('/unit/:unitId', protect, createReview);
reviewRouter.post('/', protect, createReview);

export { reviewRouter };