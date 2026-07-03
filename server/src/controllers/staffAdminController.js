import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const allowedStaffRoles = ['secondary_admin', 'primary_admin'];

export const createStaffProfile = asyncHandler(async (request, response) => {
  const { name, email, phone_number, username, password, role } = request.body;

  if (!name || !email || !phone_number || !password || !role) {
    throw new AppError('name, email, phone_number, password, and role are required', 400);
  }

  if (!allowedStaffRoles.includes(role)) {
    throw new AppError('role must be secondary_admin or primary_admin', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = username ? String(username).trim().toLowerCase() : normalizedEmail;

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
  });

  if (existingUser) {
    throw new AppError('A staff member with this email or username already exists', 409);
  }

  const password_hash = await bcrypt.hash(password, 12);

  const staff = await User.create({
    name,
    email: normalizedEmail,
    username: normalizedUsername,
    phone_number,
    password_hash,
    role
  });

  response.status(201).json({
    success: true,
    data: {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      username: staff.username,
      role: staff.role
    }
  });
});