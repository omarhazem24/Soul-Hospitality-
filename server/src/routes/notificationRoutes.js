import { Router } from 'express';
import { protect, restrictTo, requireSalesPasswordChange } from '../middleware/authMiddleware.js';
import { listSalesNotifications, markSalesNotificationsRead } from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.use(protect, restrictTo('Sales'), requireSalesPasswordChange);
notificationRouter.get('/sales', listSalesNotifications);
notificationRouter.patch('/sales/read', markSalesNotificationsRead);

export { notificationRouter };