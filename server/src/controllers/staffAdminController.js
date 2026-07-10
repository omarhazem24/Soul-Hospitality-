import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateUniqueStaffId } from '../utils/idGenerator.js';

const allowedStaffRoles = ['Admin', 'Sales'];
const DEFAULT_TEMP_STAFF_PASSWORD = 'Soul@123';

export const createStaffProfile = asyncHandler(async (request, response) => {
  const { name, email, phone_number, role } = request.body;

  if (!name || !email || !role) {
    throw new AppError('name, email, and role are required', 400);
  }

  if (!allowedStaffRoles.includes(role)) {
    throw new AppError('role must be Admin or Sales', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail
  });

  if (existingUser) {
    throw new AppError('A staff member with this email already exists', 409);
  }

  const generatedStaffId = await generateUniqueStaffId(role);
  const password_hash = await bcrypt.hash(DEFAULT_TEMP_STAFF_PASSWORD, 12);

  const staff = await User.create({
    name,
    email: normalizedEmail,
    phone_number: phone_number || '0000000000',
    password_hash,
    role,
    staffId: generatedStaffId,
    uniqueSalesId: role === 'Sales' ? generatedStaffId : undefined,
    isFirstLogin: true
  });

  response.status(201).json({
    success: true,
    data: {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      staffId: staff.staffId || null,
      uniqueSalesId: staff.uniqueSalesId || null,
      isFirstLogin: Boolean(staff.isFirstLogin),
      temporaryPassword: DEFAULT_TEMP_STAFF_PASSWORD
    }
  });
});

export const listStaffAccounts = asyncHandler(async (_request, response) => {
  const staff = await User.find({ role: { $in: allowedStaffRoles } })
    .select('name email role staffId uniqueSalesId isFirstLogin createdAt')
    .sort({ createdAt: -1 })
    .lean();

  response.json({
    success: true,
    data: staff
  });
});

export const deleteStaffAccount = asyncHandler(async (request, response) => {
  const currentUserId = String(request.user?.id || request.user?.userId || request.user?._id || '');
  const targetUserId = String(request.params.id || '');

  if (!targetUserId) {
    throw new AppError('Staff account id is required', 400);
  }

  if (currentUserId && currentUserId === targetUserId) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser || !allowedStaffRoles.includes(targetUser.role)) {
    throw new AppError('Staff account not found', 404);
  }

  await User.deleteOne({ _id: targetUser._id });

  response.json({
    success: true,
    message: 'Staff account deleted successfully'
  });
});