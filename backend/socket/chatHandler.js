import { jwtDecode } from 'jwt-decode';
import { markVMActive } from './vmMonitor.js';

export default (io, socket, rooms) => {
  socket.on('join-room', async ({ token, roomId }) => {
    try {
      if (token) {
        const payload = jwtDecode(token);
        const userId = payload.sub;
        socket.data.userId = userId;
        console.log(`👤 ${userId} joined room ${roomId}`);
        socket.to(roomId).emit('user-joined', { username: userId });
      }
      
      socket.join(roomId);
      markVMActive(roomId);

      if (!rooms[roomId]) rooms[roomId] = {};
    } catch (err) {
      console.error('🔒 auth failed', err);
      // Even if token fails, we let them join the room for monitoring
      socket.join(roomId);
      markVMActive(roomId);
    }
  });

  socket.on("send_message", (data) => {
    const { roomId } = data;
    if (matchRoom(roomId)) {
      io.to(roomId).emit("receive_message", data);
      markVMActive(roomId);
    } else {
      io.emit("receive_message", data);
    }
  });
  
  socket.on('drawing', (data) => {
    const { roomId } = data;
    if (matchRoom(roomId)) {
      socket.to(roomId).emit('drawing', data);
      markVMActive(roomId);
    }
  });
  
  socket.on('undo', (data) => {
    const { roomId } = data;
    if (matchRoom(roomId)) {
      socket.to(roomId).emit('drawing', data);
      markVMActive(roomId);
    }
  });

  function matchRoom(id) {
    return id && (typeof id === 'string' || typeof id === 'number');
  }
};
