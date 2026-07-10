import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';

dotenv.config();

const run = async () => {
  await connectDatabase(process.env.MONGODB_URI);

  const result = await User.updateMany(
    { username: { $exists: true } },
    { $unset: { username: '' } }
  );

  console.log(`Removed username from ${result.modifiedCount || 0} user document(s).`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});