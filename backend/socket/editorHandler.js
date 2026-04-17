import { exec, spawn } from 'child_process';
import path from 'path';
import { jwtDecode } from 'jwt-decode';
import { clerkClient } from '../config/clerk.js';
import { markVMActive } from './vmMonitor.js';

export default (io, socket, rooms, userList) => {
  socket.on('getFiles', (data) => {
    if (data.id) markVMActive(data.id);
    const basePath = data.path || '/app';
    // Use find to get a structured list of files/dirs, excluding heavy folders
    const cmd = `docker exec ${data.id} find ${basePath} -maxdepth 5 -not -path '*/.*' -not -path '*/node_modules*' -not -path '*/.next*' -not -path '*/dist*' -not -path '*/build*' -printf "%y %p\\n"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('getFiles error:', stderr);
        return socket.emit('files', { error: stderr });
      }

      const lines = stdout.split('\n').filter(Boolean);
      const tree = buildTreeFromFind(lines, basePath);
      socket.emit('files', { tree });
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

  socket.on('createFile', ({ id, path: filePath }) => {
    if (id) markVMActive(id);
    const cmd = `docker exec ${id} touch "${filePath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return socket.emit('createError', { error: stderr });
      socket.emit("filesReady", 'files are ready to be read');
    });
  });

  socket.on('createFolder', ({ id, path: folderPath }) => {
    if (id) markVMActive(id);
    const cmd = `docker exec ${id} mkdir -p "${folderPath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return socket.emit('createError', { error: stderr });
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

  socket.on('code-change', async ({ roomId, path, code }) => {
    if (roomId) markVMActive(roomId);
    
    // Use cached userId from join-room
    const userId = socket.data.userId || 'unknown';
    
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][path] = code;
    socket.to(roomId).emit('code-change', { path, code, userId });
  });

  socket.on('cursor-change', async ({ roomId, path, position }) => {
    if (roomId) markVMActive(roomId);
    
    // Use cached username from join-room
    const username = socket.data.username || socket.data.userId || 'Unknown User';
    
    socket.to(roomId).emit('cursor-change', { path, position, username });
  });
};

function buildTreeFromFind(lines, basePath) {
  const root = [];
  const map = {};

  lines.forEach(line => {
    const type = line[0]; // 'd' or 'f'
    let fullPath = line.substring(2).trim();
    if (!fullPath || fullPath === basePath) return;

    // Relative path from basePath
    const relativePath = fullPath.startsWith(basePath) 
      ? fullPath.slice(basePath.length).replace(/^\//, '') 
      : fullPath;
    
    const parts = relativePath.split('/').filter(Boolean);
    let currentLevel = root;
    let pathAcc = basePath;

    parts.forEach((part, index) => {
      pathAcc = (pathAcc === '/' ? '' : pathAcc) + '/' + part;
      const isLast = index === parts.length - 1;

      if (!map[pathAcc]) {
        const node = { 
          id: pathAcc, 
          name: part 
        };
        if (!isLast || type === 'd') {
          node.children = [];
        }
        map[pathAcc] = node;
        currentLevel.push(node);
      }
      currentLevel = map[pathAcc].children;
    });
  });

  return root;
}

