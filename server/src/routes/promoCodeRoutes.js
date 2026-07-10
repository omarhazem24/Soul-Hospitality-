import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  validatePromoCode
} from '../controllers/promoCodeController.js';

const promoCodeRouter = Router();

promoCodeRouter.post('/validate', protect, validatePromoCode);
promoCodeRouter.use('/admin', protect, restrictTo('Admin'));

promoCodeRouter.get('/admin/promo-codes', getPromoCodes);
promoCodeRouter.post('/admin/promo-codes', createPromoCode);
promoCodeRouter.delete('/admin/promo-codes/:id', deletePromoCode);

export { promoCodeRouter };