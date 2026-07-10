import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { quickEditUnit } from '../controllers/unitAdminController.js';

const propertyRouter = Router();

propertyRouter.use(protect);
propertyRouter.patch('/:id/quick-edit', restrictTo('primary_admin', 'secondary_admin'), quickEditUnit);

export { propertyRouter };