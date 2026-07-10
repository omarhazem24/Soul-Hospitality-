import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const DEFAULT_HR_EMAIL = 'hr@gmail.com';
const DEFAULT_HR_PASSWORD = '123';

export const seedHrAccount = async () => {
  const hrEmail = process.env.HR_EMAIL || DEFAULT_HR_EMAIL;
  const hrPassword = process.env.HR_PASSWORD || DEFAULT_HR_PASSWORD;

  const password_hash = await bcrypt.hash(hrPassword, 12);
  const existingHr = await User.findOne({
    email: hrEmail
  });

  if (!existingHr) {
    await User.create({
      name: 'Soul Hospitality HR',
      email: hrEmail,
      phone_number: '0000000000',
      password_hash,
      role: 'Customer'
    });
    return;
  }

  await User.updateOne(
    { _id: existingHr._id },
    {
      $set: {
        name: existingHr.name || 'Soul Hospitality HR',
        email: hrEmail,
        password_hash,
        role: 'Customer'
      }
    }
  );
};
