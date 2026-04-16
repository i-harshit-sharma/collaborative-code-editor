import { jwtDecode } from 'jwt-decode';

export default (io, socket, rooms) => {
  socket.on('join-room', async ({ token, roomId }) => {
    try {
      const payload = jwtDecode(token);
      const userId = payload.sub;
      socket.data.userId = userId;
      socket.join(roomId);
      console.log(`👤 ${userId} joined room ${roomId}`);

      if (!rooms[roomId]) rooms[roomId] = {};
      
      socket.to(roomId).emit('user-joined', { username: userId });
    } catch (err) {
      console.error('🔒 auth failed', err);
      socket.emit('error', { message: 'authentication_failed' });
    }
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });
  
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });
  
  socket.on('undo', (data) => {
    socket.broadcast.emit('drawing', data);
  });
};
