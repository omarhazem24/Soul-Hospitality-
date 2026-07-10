import express from 'express';
import cors from 'cors';
import { authRouter } from './src/routes/authRoutes.js';
import { adminRouter } from './src/routes/adminRoutes.js';
import { salesRouter } from './src/routes/salesRoutes.js';
import { recruitmentRouter } from './src/routes/recruitmentRoutes.js';
import { reviewRouter } from './src/routes/reviewRoutes.js';
import { unitReviewRouter } from './src/routes/unitReviewRoutes.js';
import { unitRouter } from './src/routes/unitRoutes.js';
import { bookingRouter } from './src/routes/bookingRoutes.js';
import { paymentRouter } from './src/routes/paymentRoutes.js';
import { propertyRouter } from './src/routes/propertyRoutes.js';
import { projectRouter } from './src/routes/projectRoutes.js';
import { promoCodeRouter } from './src/routes/promoCodeRoutes.js';
import { notificationRouter } from './src/routes/notificationRoutes.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json({
    verify: (request, response, buffer) => {
      request.rawBody = buffer?.toString('utf8') || '';
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (request, response) => {
    response.json({ success: true, status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/units', unitRouter);
  app.use('/api/units', unitReviewRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/reviews', reviewRouter);
  app.use('/api/recruitment', recruitmentRouter);
  app.use('/api/promo-codes', promoCodeRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/sales', salesRouter);

  app.use(errorHandler);

  return app;
};
