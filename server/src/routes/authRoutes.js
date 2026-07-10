import { Router } from 'express';
import { changePassword, forgotPassword, login, me, register, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/me', protect, me);
authRouter.patch('/change-password', protect, changePassword);

export { authRouter };