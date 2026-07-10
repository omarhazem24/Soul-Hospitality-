import { Router } from 'express';
import { kashierWebhook } from '../controllers/paymentController.js';

const paymentRouter = Router();

paymentRouter.post('/webhook/kashier', kashierWebhook);
paymentRouter.post('/kashier-webhook', kashierWebhook);

export { paymentRouter };
