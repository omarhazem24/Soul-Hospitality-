import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  return mongoose.connection;
};
