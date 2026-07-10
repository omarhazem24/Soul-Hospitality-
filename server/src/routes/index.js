import { Router } from 'express';
import { bookingRouter } from './bookingRoutes.js';
import { unitRouter } from './unitRoutes.js';
import { paymentRouter } from './paymentRoutes.js';
import { recruitmentRouter } from './recruitmentRoutes.js';

const router = Router();

router.use('/units', unitRouter);
router.use('/bookings', bookingRouter);
router.use('/payments', paymentRouter);
router.use('/recruitment', recruitmentRouter);

export { router };
