import { Router } from 'express';
import { getUnitReviews } from '../controllers/reviewController.js';

const unitReviewRouter = Router();

unitReviewRouter.get('/:unitId/reviews', getUnitReviews);

export { unitReviewRouter };