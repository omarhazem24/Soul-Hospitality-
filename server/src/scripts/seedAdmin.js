import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const seedAdminAccount = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL (or ADMIN_USERNAME) and ADMIN_PASSWORD are required');
  }

  const password_hash = await bcrypt.hash(adminPassword, 12);
  const existingAdmin = await User.findOne({
    $or: [{ username: adminEmail }, { email: adminEmail }]
  });

  if (!existingAdmin) {
    await User.create({
      name: 'Soul Hospitality Admin',
      email: adminEmail,
      username: adminEmail,
      phone_number: '0000000000',
      password_hash,
      role: 'primary_admin'
    });
    return;
  }

  await User.updateOne(
    { _id: existingAdmin._id },
    {
      $set: {
        name: existingAdmin.name || 'Soul Hospitality Admin',
        email: adminEmail,
        username: adminEmail,
        password_hash,
        role: 'primary_admin'
      }
    }
  );
};