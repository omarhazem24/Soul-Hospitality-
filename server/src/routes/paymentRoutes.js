import { Router } from 'express';
import { kashierWebhook } from '../controllers/paymentController.js';

const paymentRouter = Router();

paymentRouter.post('/webhook/kashier', kashierWebhook);

export { paymentRouter };
