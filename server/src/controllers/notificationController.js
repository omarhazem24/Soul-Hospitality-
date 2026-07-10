import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSalesNotifications = asyncHandler(async (request, response) => {
  const userId = request.user?.id;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0);

  response.json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
});

export const markSalesNotificationsRead = asyncHandler(async (request, response) => {
  const userId = request.user?.id;

  await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );

  response.json({
    success: true,
    message: 'Notifications marked as read'
  });
});