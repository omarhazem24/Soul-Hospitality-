import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPasswordResetEmail } from '../services/mailService.js';
import { assertPasswordPolicy } from '../utils/passwordPolicy.js';

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  staffId: user.staffId || null,
  uniqueSalesId: user.uniqueSalesId || null,
  isFirstLogin: Boolean(user.isFirstLogin),
  token: signToken(user)
});

const buildSessionResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  staffId: user.staffId || null,
  uniqueSalesId: user.uniqueSalesId || null,
  isFirstLogin: Boolean(user.isFirstLogin),
  profile_photo: user.profile_photo || null
});

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getResetUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
};

export const register = asyncHandler(async (request, response) => {
  try {
    const { name, email, phone_number, password } = request.body;

    if (!name || !email || !phone_number || !password) {
      throw new AppError('name, email, phone_number, and password are required', 400);
    }

    assertPasswordPolicy(password);

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone_number,
      password_hash,
      role: 'Customer'
    });

    response.status(201).json({
      success: true,
      data: buildAuthResponse(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError('Email already registered', 409);
    }

    if (error instanceof AppError) {
      throw error;
    }

    console.error('Registration failed', error);
    throw new AppError('Unable to complete registration right now. Please try again later.', 500);
  }
});

export const login = asyncHandler(async (request, response) => {
  try {
    const { identifier, email, password } = request.body;
    const loginIdentifier = String(identifier || email || '').trim().toLowerCase();

    if (!loginIdentifier || !password) {
      throw new AppError('identifier and password are required', 400);
    }

    const user = await User.findOne({
      email: loginIdentifier
    });

    if (!user) {
      throw new AppError('Invalid email or password combination', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password combination', 401);
    }

    if (['Sales', 'Admin'].includes(user.role) && user.isFirstLogin) {
      response.json({
        success: true,
        data: {
          ...buildAuthResponse(user),
          forcePasswordChange: true
        }
      });
      return;
    }

    response.json({
      success: true,
      data: buildAuthResponse(user)
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Login failed', error);
    throw new AppError('Unable to sign in right now. Please try again later.', 500);
  }
});

export const me = asyncHandler(async (request, response) => {
  const userId = request.user?.id || request.user?.userId || request.user?._id;

  if (!userId) {
    throw new AppError('Authentication required', 401);
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  response.json({
    success: true,
    data: buildSessionResponse(user)
  });
});

export const changePassword = asyncHandler(async (request, response) => {
  try {
    const userId = request.user?.id || request.user?.userId || request.user?._id;
    const { currentPassword, newPassword } = request.body;

    if (!userId || !newPassword) {
      throw new AppError('newPassword is required', 400);
    }

    assertPasswordPolicy(newPassword);

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = currentPassword ? await bcrypt.compare(currentPassword, user.password_hash) : false;

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is invalid', 401);
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.isFirstLogin = false;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    response.json({
      success: true,
      data: buildSessionResponse(user)
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Change password failed', error);
    throw new AppError('Unable to change password right now. Please try again later.', 500);
  }
});

export const forgotPassword = asyncHandler(async (request, response) => {
  try {
    const normalizedEmail = String(request.body?.email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      throw new AppError('email is required', 400);
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const plainToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetTokenHash = hashResetToken(plainToken);
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: getResetUrl(plainToken)
      });
    }

    response.json({
      success: true,
      data: {
        message: 'If an account with that email exists, a password reset link has been sent.'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Forgot password failed', error);
    throw new AppError('Unable to process password reset right now. Please try again later.', 500);
  }
});

export const resetPassword = asyncHandler(async (request, response) => {
  try {
    const token = String(request.body?.token || '').trim();
    const newPassword = request.body?.newPassword;

    if (!token || !newPassword) {
      throw new AppError('token and newPassword are required', 400);
    }

    assertPasswordPolicy(newPassword);

    const user = await User.findOne({
      passwordResetTokenHash: hashResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.isFirstLogin = false;
    await user.save();

    response.json({
      success: true,
      data: {
        message: 'Password reset successfully.'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error('Reset password failed', error);
    throw new AppError('Unable to reset password right now. Please try again later.', 500);
  }
});