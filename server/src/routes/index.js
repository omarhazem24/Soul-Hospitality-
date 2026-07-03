import { Router } from 'express';
import { bookingRouter } from './bookingRoutes.js';
import { unitRouter } from './unitRoutes.js';
import { paymentRouter } from './paymentRoutes.js';

const router = Router();

router.use('/units', unitRouter);
router.use('/bookings', bookingRouter);
router.use('/payments', paymentRouter);

export { router };
