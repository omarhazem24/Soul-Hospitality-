import { Router } from 'express';
import { protect, restrictTo, requireSalesPasswordChange } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import {
  createSalesReservation,
  deleteSalesReservation,
  getSalesCommissions,
  getSalesDashboardSummary,
  listSalesReservations,
  listSalesSchedule,
  updateSalesReservationStatus
} from '../controllers/salesController.js';

const salesRouter = Router();

salesRouter.use(protect, restrictTo('Sales'), requireSalesPasswordChange);

salesRouter.get('/dashboard', getSalesDashboardSummary);
salesRouter.get('/bookings', listSalesReservations);
salesRouter.post('/bookings', uploadSingleImage.single('transfer_evidence_photo'), createSalesReservation);
salesRouter.patch('/bookings/:id/status', updateSalesReservationStatus);
salesRouter.delete('/bookings/:id', deleteSalesReservation);
salesRouter.get('/schedule', listSalesSchedule);
salesRouter.get('/commissions', getSalesCommissions);

export { salesRouter };