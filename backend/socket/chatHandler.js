import { jwtDecode } from 'jwt-decode';
import { markVMActive } from './vmMonitor.js';

export default (io, socket, rooms) => {
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
