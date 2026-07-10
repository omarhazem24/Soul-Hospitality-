import { Server } from 'socket.io';

let io;

export const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.handshake.query || {};

    if (userId && role === 'Sales') {
      socket.join(`sales-user:${String(userId)}`);
    }

    socket.on('disconnect', () => {
      // No-op: rooms are auto-cleaned by Socket.io.
    });
  });

  return io;
};

export const emitSalesNotification = (userId, payload) => {
  if (!io || !userId) {
    return;
  }

  io.to(`sales-user:${String(userId)}`).emit('sales:notification', payload);
  io.to(`sales-user:${String(userId)}`).emit('NEW_NOTIFICATION', payload);
};