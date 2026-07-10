import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
const DEFAULT_ADMIN_PASSWORD = '123';

export const seedAdminAccount = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const password_hash = await bcrypt.hash(adminPassword, 12);
  const existingAdmin = await User.findOne({
    email: adminEmail
  });

  if (!existingAdmin) {
    await User.create({
      name: 'Soul Hospitality Admin',
      email: adminEmail,
      phone_number: '0000000000',
      password_hash,
      role: 'Admin'
    });
    return;
  }

  await User.updateOne(
    { _id: existingAdmin._id },
    {
      $set: {
        name: existingAdmin.name || 'Soul Hospitality Admin',
        email: adminEmail,
        password_hash,
        role: 'Admin'
      }
    }
  );
};