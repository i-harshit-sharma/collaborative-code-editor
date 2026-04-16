import { Server } from 'socket.io';
import terminalHandler from './terminalHandler.js';
import editorHandler from './editorHandler.js';
import chatHandler from './chatHandler.js';
import { clerkClient } from '../config/clerk.js';

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

    // Register handlers
    terminalHandler(io, socket);
    editorHandler(io, socket, rooms, userList);
    chatHandler(io, socket, rooms);
  });

  return io;
};
