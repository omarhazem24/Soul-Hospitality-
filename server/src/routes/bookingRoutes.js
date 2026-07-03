import { Router } from 'express';
import { createBookingHold } from '../controllers/bookingController.js';

const bookingRouter = Router();

bookingRouter.post('/checkout', createBookingHold);

export { bookingRouter };
