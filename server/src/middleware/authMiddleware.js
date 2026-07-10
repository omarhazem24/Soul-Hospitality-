import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const protect = (request, response, next) => {
  const authorizationHeader = request.headers.authorization || '';
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = {
      ...payload,
      id: payload.id || payload.userId || payload._id,
      role: payload.role
    };
    return next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};

export const restrictTo = (...allowedRoles) => (request, response, next) => {
  if (!request.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!allowedRoles.includes(request.user.role)) {
    return next(new AppError('Forbidden', 403));
  }

  return next();
};

export const requireStaffPasswordChange = async (request, response, next) => {
  try {
    const userId = request.user?.id || request.user?.userId || request.user?._id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const user = await User.findById(userId).select('role isFirstLogin');

    if (['Sales', 'Admin'].includes(user?.role) && user.isFirstLogin && !String(request.path || '').includes('/change-password')) {
      return next(new AppError('Password change required before continuing', 423));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAuth = protect;
export const requireAdmin = restrictTo('primary_admin');
export const requireSalesPasswordChange = requireStaffPasswordChange;