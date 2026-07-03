import dotenv from 'dotenv';

dotenv.config();

const [{ connectDatabase }, { initializeRedisConnections }, { seedAdminAccount }, { createApp }, { startBookingHoldExpiryListener }] = await Promise.all([
  import('./src/config/database.js'),
  import('./src/config/redis.js'),
  import('./src/scripts/seedAdmin.js'),
  import('./app.js'),
  import('./src/jobs/bookingHoldExpiryListener.js')
]);

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

const bootstrap = async () => {
  await connectDatabase(mongoUri);

  await seedAdminAccount();

  await initializeRedisConnections();

  await startBookingHoldExpiryListener();

  const app = createApp();
  app.listen(port, () => {
    console.log(`Soul Hospitality API listening on port ${port}`);
    console.log("👉 Multer is explicitly expecting form-data file keys to be named: 'photos'");
  });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
