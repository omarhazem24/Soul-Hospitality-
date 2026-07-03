import { Router } from 'express';
import multer from 'multer';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { listSlideshows, createSlideshow, deleteSlideshow } from '../controllers/slideshowController.js';
import { createAdminBooking, listBookingRequests, updateBookingRequestStatus } from '../controllers/bookingAdminController.js';
import { listApplications, updateApplicationStatus } from '../controllers/recruitmentController.js';
import { createUnit, updateUnit, deleteUnit, listUnits } from '../controllers/unitAdminController.js';
import { listAllReviews, hideReview } from '../controllers/reviewController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { createStaffProfile } from '../controllers/staffAdminController.js';

const adminRouter = Router();
const vanillaMulter = multer({ storage: multer.memoryStorage() });

const unitUploadDiagnostic = (request, response, next) => {
  console.log('--- Multer Diagnostic Audit ---');
  console.log('Incoming Headers:', request.headers['content-type']);
  console.log('Body fields parsed before Multer:', request.body);
  console.log('Readable Stream State:', {
    readable: request.readable,
    readableEnded: request.readableEnded,
    complete: request.complete,
    aborted: request.aborted
  });
  next();
};

adminRouter.get('/slideshow', listSlideshows);
adminRouter.use(protect, restrictTo('primary_admin', 'secondary_admin'));

adminRouter.post('/slideshow', uploadSingleImage.single('image'), createSlideshow);
adminRouter.delete('/slideshow/:id', deleteSlideshow);

adminRouter.get('/bookings/requests', listBookingRequests);
adminRouter.post('/bookings', createAdminBooking);
adminRouter.patch('/bookings/:id/status', updateBookingRequestStatus);

adminRouter.get('/recruitment', listApplications);
adminRouter.patch('/recruitment/:id', updateApplicationStatus);

adminRouter.get('/units', listUnits);
adminRouter.post('/units', unitUploadDiagnostic, vanillaMulter.array('photos', 10), createUnit);
adminRouter.put('/units/:id', vanillaMulter.array('photos', 10), updateUnit);
adminRouter.delete('/units/:id', deleteUnit);

adminRouter.get('/reviews', listAllReviews);
adminRouter.delete('/reviews/:id', hideReview);

adminRouter.get('/dashboard/summary', getDashboardSummary);

adminRouter.post('/create-staff', protect, restrictTo('primary_admin'), createStaffProfile);

export { adminRouter };
