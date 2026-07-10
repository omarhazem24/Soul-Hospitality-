import { Router } from 'express';
import { createBookingHold } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadBookingIdentityPhotos } from '../middleware/uploadMiddleware.js';

const bookingRouter = Router();

bookingRouter.post('/checkout', protect, uploadBookingIdentityPhotos.array('id_photos', 4), createBookingHold);

export { bookingRouter };
