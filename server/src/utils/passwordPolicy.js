import { AppError } from '../utils/AppError.js';

export const PASSWORD_POLICY_MESSAGES = {
  minLength: 'Password must be at least 8 characters long.',
  uppercase: 'Password must contain at least one uppercase letter.',
  lowercase: 'Password must contain at least one lowercase letter.'
};

export const getPasswordPolicyChecks = (password) => {
  const value = String(password || '');

  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value)
  };
};

export const assertPasswordPolicy = (password) => {
  const checks = getPasswordPolicyChecks(password);

  if (!checks.minLength) {
    throw new AppError(PASSWORD_POLICY_MESSAGES.minLength, 400);
  }

  if (!checks.uppercase) {
    throw new AppError(PASSWORD_POLICY_MESSAGES.uppercase, 400);
  }

  if (!checks.lowercase) {
    throw new AppError(PASSWORD_POLICY_MESSAGES.lowercase, 400);
  }

  return checks;
};