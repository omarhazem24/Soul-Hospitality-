import dotenv from "dotenv";
import http from 'http';

dotenv.config();

const [
  { connectDatabase },
  { seedAdminAccount },
  { seedHrAccount },
  { createApp },
  { initializeSocketServer },
  { startBookingHoldExpiryListener },
] = await Promise.all([
  import("./src/config/database.js"),
  import("./src/scripts/seedAdmin.js"),
  import("./src/scripts/seedHrAccount.js"),
  import("./app.js"),
  import('./src/config/socket.js'),
  import("./src/jobs/bookingHoldExpiryListener.js"),
]);

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

const bootstrap = async () => {
  await connectDatabase(mongoUri);

  await seedAdminAccount();

  await seedHrAccount();

  await startBookingHoldExpiryListener();

  const app = createApp();
  const httpServer = http.createServer(app);
  initializeSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`Soul Hospitality API listening on port ${port}`);
    console.log(
      "👉 Multer is explicitly expecting form-data file keys to be named: 'photos'",
    );
  });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
