export const getPasswordRuleChecks = (password) => {
  const value = String(password || '');

  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value)
  };
};

export const passwordRuleItems = [
  { key: 'minLength', label: '8 characters minimum' },
  { key: 'uppercase', label: 'At least one uppercase letter' },
  { key: 'lowercase', label: 'At least one lowercase letter' }
];