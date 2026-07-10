import { User } from '../models/User.js';

const MAX_ATTEMPTS = 100;

const randomDigitString = (length) => Array.from({ length }, () => String(Math.floor(Math.random() * 10))).join('');

export const isValidPattern = (digits) => {
  const value = String(digits || '');

  for (let i = 0; i < value.length - 2; i += 1) {
    if (value[i] === value[i + 1] && value[i] === value[i + 2]) {
      return false;
    }
  }

  return true;
};

export const generateUniqueStaffId = async (roleType) => {
  const normalizedRole = String(roleType || '').trim().toLowerCase();
  const prefix = normalizedRole === 'admin' ? 'A' : 'S';

  for (let attempts = 0; attempts < MAX_ATTEMPTS; attempts += 1) {
    const digits = randomDigitString(4);

    if (!isValidPattern(digits)) {
      continue;
    }

    const generatedId = `${prefix}${digits}`;
    const existingUser = await User.findOne({ staffId: generatedId }).select('_id').lean();

    if (!existingUser) {
      return generatedId;
    }
  }

  throw new Error('Unable to generate a unique staff ID');
};