import { Router } from 'express';
import { submitApplication } from '../controllers/recruitmentController.js';
import { uploadResumePdf } from '../middleware/uploadMiddleware.js';

const recruitmentRouter = Router();

recruitmentRouter.post('/apply', uploadResumePdf.single('resume'), submitApplication);

export { recruitmentRouter };