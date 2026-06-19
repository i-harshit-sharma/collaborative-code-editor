import { Server } from 'socket.io';
import terminalHandler from './terminalHandler.js';
import editorHandler from './editorHandler.js';
import chatHandler from './chatHandler.js';
import { verifyToken } from '@clerk/express';
import { clerkClient } from '../config/clerk.js';
import { checkAndScheduleShutdown, markVMActive } from './vmMonitor.js';
import logger from '../utils/logger.js';

const rooms = {};
let userList = { data: [] };

// Refresh user list periodically
setInterval(async () => {
  try {
    userList = await clerkClient.users.getUserList();
  } catch (err) {
    logger.error(`Failed to fetch user list: ${err.message}`);
  }
}, 30000);

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: true, // Dynamically allow any requesting origin
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'], // Ensure both are enabled
    allowEio3: true // Support for older clients if any
  });

  // Middleware: Strict validation at handshake
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      logger.warn(`❌ Connection rejected for socket ${socket.id}: No token provided`);
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        logger.error('❌ CLERK_SECRET_KEY is missing in environment variables');
        return next(new Error('Internal server error'));
      }

      const verifiedToken = await verifyToken(token, {
        secretKey: secretKey,
      });

      if (!verifiedToken) {
        throw new Error('Verification returned null');
      }

      socket.data.userId = verifiedToken.sub;
      socket.data.exp = verifiedToken.exp;
      socket.data.token = token;

      // Pre-fetch user info using ID
      try {
        const user = userList?.data?.find(u => u.id === verifiedToken.sub) || 
                     await clerkClient.users.getUser(verifiedToken.sub);
        socket.data.username = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : verifiedToken.sub;
      } catch (userErr) {
        logger.warn(`Could not fetch full user info: ${userErr.message}`);
        socket.data.username = verifiedToken.sub;
      }
      
      logger.success(`✅ Socket ${socket.id} authenticated for user ${socket.data.username}`);
      next();
    } catch (err) {
      logger.error(`❌ Socket authentication failed for ${socket.id}: ${err.message}`);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);
    
    // Strict validation throughout the session: Check token on every event
    socket.use((packet, next) => {
      const now = Math.floor(Date.now() / 1000);
      if (socket.data.exp && now >= socket.data.exp) {
        logger.warn(`⚠️ Token expired for socket ${socket.id}. Disconnecting.`);
        socket.emit('error', 'Session expired. Please re-authenticate.');
        socket.disconnect(true);
        return next(new Error('Session expired'));
      }
      next();
    });

    // Handle token updates from client
    socket.on('authenticate', async ({ token }) => {
      try {
        const verifiedToken = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        socket.data.userId = verifiedToken.sub;
        socket.data.exp = verifiedToken.exp;
        socket.data.token = token;
        logger.info(`🔄 Token refreshed for user: ${socket.data.userId}`);
      } catch (err) {
        logger.error(`❌ Re-authentication failed: ${err.message}`);
        socket.disconnect(true);
      }
    });

    // Initial signal
    socket.emit('filesReady', 'files are ready to be read');

    // Centralized Room Joining
    socket.on('join-room', async ({ roomId }) => {
      if (!roomId) return;
      
      socket.join(roomId);
      markVMActive(roomId);
      logger.info(`📡 Socket ${socket.id} (${socket.data.username}) joined room ${roomId}`);

      if (!rooms[roomId]) rooms[roomId] = {};
      
      socket.to(roomId).emit('user-joined', { username: socket.data.username });
    });

    // Detect when user is leaving rooms
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);
      const vmRooms = rooms.filter(r => r !== socket.id);
      
      vmRooms.forEach(roomId => {
        setImmediate(() => {
          checkAndScheduleShutdown(io, roomId);
        });
      });
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });

    // Register handlers
    terminalHandler(io, socket);
    editorHandler(io, socket, rooms, userList);
    chatHandler(io, socket, rooms);
  });

  return io;
};
