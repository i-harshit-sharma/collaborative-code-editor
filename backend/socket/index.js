import { Server } from 'socket.io';
import terminalHandler from './terminalHandler.js';
import editorHandler from './editorHandler.js';
import chatHandler from './chatHandler.js';
import { jwtDecode } from 'jwt-decode';
import { clerkClient } from '../config/clerk.js';
import { checkAndScheduleShutdown, markVMActive } from './vmMonitor.js';

const rooms = {};
let userList = { data: [] };

// Refresh user list every 10 seconds
setInterval(async () => {
  try {
    userList = await clerkClient.users.getUserList();
  } catch (err) {
    console.error('Failed to fetch user list:', err);
  }
}, 10000);

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    
    // Initial signal
    socket.emit('sendToken', 'Send token');
    socket.emit('filesReady', 'files are ready to be read');

    // Centralized Room Joining
    socket.on('join-room', async ({ token, roomId }) => {
      socket.join(roomId);
      markVMActive(roomId);
      console.log(`📡 Socket ${socket.id} joined room ${roomId}`);

      if (!rooms[roomId]) rooms[roomId] = {};

      if (token) {
        try {
          const payload = jwtDecode(token);
          const userId = payload.sub;
          socket.data.userId = userId;

          // Attempt to resolve username from the pre-fetched userList
          const user = userList.data.find(u => u.id === userId);
          if (user) {
            socket.data.username = `${user.firstName} ${user.lastName}`;
          } else {
            // Fallback: Fetch specific user if not in list
            const fetchedUser = await clerkClient.users.getUser(userId);
            socket.data.username = `${fetchedUser.firstName} ${fetchedUser.lastName}`;
          }
          
          socket.to(roomId).emit('user-joined', { username: socket.data.username || userId });
          console.log(`👤 User ${socket.data.username} identified for socket ${socket.id}`);
        } catch (err) {
          console.error('❌ Failed to identify user in join-room:', err);
        }
      }
    });

    // Detect when user is leaving rooms
    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);
      // Filter out the socket's own ID room
      const vmRooms = rooms.filter(r => r !== socket.id);
      
      vmRooms.forEach(roomId => {
        // Use setImmediate to check after the socket has actually left
        setImmediate(() => {
          checkAndScheduleShutdown(io, roomId);
        });
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });

    // Register handlers
    terminalHandler(io, socket);
    editorHandler(io, socket, rooms, userList);
    chatHandler(io, socket, rooms);
  });

  return io;
};
