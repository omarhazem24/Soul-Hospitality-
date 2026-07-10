import { Booking } from '../models/Booking.js';
import { cancelExpiredHoldIfUnpaid } from '../services/bookingService.js';

const POLL_INTERVAL_MS = Number(process.env.BOOKING_HOLD_SWEEP_INTERVAL_MS || 30000);
const SWEEP_BATCH_SIZE = Number(process.env.BOOKING_HOLD_SWEEP_BATCH_SIZE || 100);

let sweepTimer = null;

const sweepExpiredBookingHolds = async () => {
  const now = new Date();

  const expiredHolds = await Booking.find({
    status: 'Pending',
    holdExpiresAt: { $lte: now }
  }).select('_id').limit(SWEEP_BATCH_SIZE).lean();

  if (!expiredHolds.length) {
    return;
  }

  await Promise.all(
    expiredHolds.map((item) => cancelExpiredHoldIfUnpaid(item._id))
  );
};

export const startBookingHoldExpiryListener = async () => {
  if (sweepTimer) {
    return;
  }

  await sweepExpiredBookingHolds();

  sweepTimer = setInterval(() => {
    sweepExpiredBookingHolds().catch((error) => {
      console.error('Booking hold sweep error:', error?.message || error);
    });
  }, POLL_INTERVAL_MS);
};
