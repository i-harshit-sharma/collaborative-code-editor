import { exec, spawn } from 'child_process';
import path from 'path';
import { clerkClient } from '../config/clerk.js';
import { markVMActive } from './vmMonitor.js';
import logger from '../utils/logger.js';

export default (io, socket, rooms, userList) => {
  socket.on('getFiles', (data) => {
    if (data.id) markVMActive(data.id);
    const basePath = data.path || '/app';
    // Use find to get a structured list of files/dirs, excluding heavy folders
    const cmd = `docker exec ${data.id} find ${basePath} -maxdepth 5 -not -path '*/.*' -not -path '*/node_modules*' -not -path '*/.next*' -not -path '*/dist*' -not -path '*/build*' -printf "%y %p\\n"`;
    
    exec(cmd, (error, stdout, stderr) => {
      const lines = stdout ? stdout.split('\n').filter(Boolean) : [];
      
      if (error && lines.length === 0) {
        const errorMsg = stderr.trim() || error.message;
        logger.error(`getFiles error for VM ${data.id}: ${errorMsg}`);
        return socket.emit('files', { error: errorMsg });
      }

      const tree = buildTreeFromFind(lines, basePath);
      socket.emit('files', { tree });
    });
  });


  socket.on('openFile', (data) => {
    if (data.id) markVMActive(data.id);
    const cmd = `docker exec ${data.id} cat ${data.path}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('fileContent', { error: stderr.trim() || error.message });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });

  socket.on('deleteFile', (data) => {
    if (data.id) markVMActive(data.id);
    const cmd = `docker exec ${data.id} rm -rf ${data.path}`;
    logger.info(`🗑️ Deleting file ${data.path} in VM ${data.id}`);
    socket.emit("filesReady", 'files are ready to be read');
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error(`deleteFile error: ${stderr || error.message}`);
        return socket.emit('fileContent', { error: stderr.trim() || error.message });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });

  socket.on('renameFile', ({ id, path: oldPath, newName }) => {
    if (id) markVMActive(id);
    const dir = path.posix.dirname(oldPath);
    const newPath = path.posix.join(dir, newName);
    const cmd = `docker exec ${id} mv "${oldPath}" "${newPath}"`;
    logger.info(`📝 Renaming ${oldPath} to ${newName} in VM ${id}`);
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error(`renameFile error: ${stderr || err.message}`);
        return socket.emit('renameError', { error: stderr.trim() || err.message });
      }
      socket.emit("filesReady", 'files are ready to be read');
    });
  });

  socket.on('createFile', ({ id, path: filePath }) => {
    if (id) markVMActive(id);
    const cmd = `docker exec ${id} touch "${filePath}"`;
    logger.info(`📄 Creating file ${filePath} in VM ${id}`);
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error(`createFile error: ${stderr || err.message}`);
        return socket.emit('createError', { error: stderr.trim() || err.message });
      }
      socket.emit("filesReady", 'files are ready to be read');
    });
  });

  socket.on('createFolder', ({ id, path: folderPath }) => {
    if (id) markVMActive(id);
    const cmd = `docker exec ${id} mkdir -p "${folderPath}"`;
    logger.info(`📁 Creating folder ${folderPath} in VM ${id}`);
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error(`createFolder error: ${stderr || err.message}`);
        return socket.emit('createError', { error: stderr.trim() || err.message });
      }
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
      logger.error(`save-file error for ${filePath} in ${roomId}: ${err.message}`);
      socket.emit('saveError', { error: err.message });
    });
    proc.on('close', (exitCode) => {
      if (exitCode === 0) {
        logger.success(`💾 File saved: ${filePath} in ${roomId}`);
        socket.emit('saveSuccess', { path: filePath });
      } else {
        logger.error(`save-file tee error (code ${exitCode}) for ${filePath}`);
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

