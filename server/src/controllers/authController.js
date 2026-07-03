import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      username: user.username || null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  username: user.username || null,
  role: user.role,
  token: signToken(user)
});

export const register = asyncHandler(async (request, response) => {
  const { name, email, phone_number, password } = request.body;

  if (!name || !email || !phone_number || !password) {
    throw new AppError('name, email, phone_number, and password are required', 400);
  }

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
    role: 'customer'
  });

  response.status(201).json({
    success: true,
    data: buildAuthResponse(user)
  });
});

export const login = asyncHandler(async (request, response) => {
  const { identifier, email, username, password } = request.body;
  const loginIdentifier = String(identifier || email || username || '').trim().toLowerCase();

  if (!loginIdentifier || !password) {
    throw new AppError('identifier and password are required', 400);
  }

  const user = await User.findOne({
    $or: [
      { email: loginIdentifier },
      { username: loginIdentifier }
    ]
  });

  if (!user) {
    throw new AppError('Invalid login credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid login credentials', 401);
  }

  response.json({
    success: true,
    data: buildAuthResponse(user)
  });
});