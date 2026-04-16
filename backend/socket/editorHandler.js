import { exec, spawn } from 'child_process';
import path from 'path';
import { jwtDecode } from 'jwt-decode';
import { clerkClient } from '../config/clerk.js';
import { markVMActive } from './vmMonitor.js';

export default (io, socket, rooms, userList) => {
  socket.on('getFiles', (data) => {
    if (data.id) markVMActive(data.id);
    const cmd = `docker exec ${data.id} ls -laR ${data.path}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('files', { error: stderr });
      }
      const files = stdout.split('\n').slice(1).map(line => line.trim()).filter(Boolean);
      socket.emit('files', { files });
    });
  });

  socket.on('openFile', (data) => {
    if (data.id) markVMActive(data.id);
    const cmd = `docker exec ${data.id} cat ${data.path}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('fileContent', { error: stderr });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });

  socket.on('deleteFile', (data) => {
    if (data.id) markVMActive(data.id);
    const cmd = `docker exec ${data.id} rm -rf ${data.path}`;
    socket.emit("filesReady", 'files are ready to be read');
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('fileContent', { error: stderr });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });

  socket.on('renameFile', ({ id, path: oldPath, newName }) => {
    if (id) markVMActive(id);
    const dir = path.posix.dirname(oldPath);
    const newPath = path.posix.join(dir, newName);
    const cmd = `docker exec ${id} mv "${oldPath}" "${newPath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return socket.emit('renameError', { error: stderr });
      socket.emit("filesReady", 'files are ready to be read');
    });
  });

  socket.on('save-file', ({ roomId, path: rawPath, code }) => {
    if (roomId) markVMActive(roomId);
    const filePath = rawPath.replace(/\\/g, '/');
    const proc = spawn('docker', ['exec', '-i', roomId, 'tee', filePath]);
    proc.stdin.write(code);
    proc.stdin.end();
    proc.on('error', (err) => {
      socket.emit('saveError', { error: err.message });
    });
    proc.on('close', (exitCode) => {
      if (exitCode === 0) {
        socket.emit('saveSuccess', { path: filePath });
      } else {
        socket.emit('saveError', { error: `tee exited with code ${exitCode}` });
      }
    });
  });

  socket.on('code-change', async ({ roomId, path, code, token }) => {
    if (!token) return;
    if (roomId) markVMActive(roomId);
    const payload = jwtDecode(token);
    const userId = payload.sub;
    
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][path] = code;
    socket.to(roomId).emit('code-change', { path, code, userId: userId });
  });

  socket.on('cursor-change', async ({ roomId, path, position, token }) => {
    if (!token) {
      if (roomId) markVMActive(roomId);
      socket.to(roomId).emit('cursor-change', { path, position, username: roomId });
      return;
    }
    if (roomId) markVMActive(roomId);
    const payload = jwtDecode(token);
    const userId = payload.sub;
    const currentUsers = await clerkClient.users.getUserList();
    const user = currentUsers?.data?.find(u => u.id === userId);
    const userName = user ? (user.firstName + " " + user.lastName) : "Unknown User";
    socket.to(roomId).emit('cursor-change', { path, position, username: userName });
  });
};
