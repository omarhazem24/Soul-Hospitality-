import { getRedisSubscriber } from '../config/redis.js';
import { cancelExpiredHoldIfUnpaid } from '../services/bookingService.js';

const HOLD_KEY_PREFIX = 'booking:hold:';
const expirationChannelPattern = '__keyevent@*__:expired';

export const startBookingHoldExpiryListener = async () => {
  const subscriber = getRedisSubscriber();

  if (!subscriber.isOpen) {
    await subscriber.connect();
  }

  await subscriber.pSubscribe(expirationChannelPattern, async (message, channel) => {
    const expiredKey = message;

    if (!expiredKey.startsWith(HOLD_KEY_PREFIX)) {
      return;
    }

    const bookingId = expiredKey.slice(HOLD_KEY_PREFIX.length);
    await cancelExpiredHoldIfUnpaid(bookingId);
  });
};
