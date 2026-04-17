import { jwtDecode } from 'jwt-decode';
import docker from '../config/docker.js';
import pty from '@lydell/node-pty';
import { randomBytes } from 'crypto';
import User from '../models/User.js';

export default (io, socket) => {
  const ptyProcesses = new Map();

  socket.on('sendToken', async ({ token, containerId, terminalId }) => {
    console.log('Received containerId:', containerId, 'terminalId:', terminalId);

    if (!terminalId) {
      console.error('Missing terminalId in sendToken');
      return;
    }

    let payload;
    try {
      payload = jwtDecode(token);
    } catch (err) {
      console.error('Invalid token:', err);
      socket.emit('output', { terminalId, data: 'Error: Invalid token.\r\n' });
      return;
    }

    let user;
    try {
      user = await User.findOne({ userId: payload.sub });
    } catch (err) {
      console.error('Database lookup error:', err);
      socket.emit('output', { terminalId, data: 'Error: Database error.\r\n' });
      return;
    }
    if (!user) {
      console.error('User not found in DB:', payload.sub);
      socket.emit('output', { terminalId, data: 'Error: User not found.\r\n' });
      return;
    }

    let container = docker.getContainer(containerId);
    let containerIdOrName = containerId;
    try {
      const info = await container.inspect();
      if (!info.State.Running) {
        await container.start();
        console.log('Started existing container:', containerIdOrName);
      }
    } catch (err) {
      console.log('Container not found or not running, creating a new one');
      try {
        container = await docker.createContainer({
          Image: 'ubuntu',
          name: randomBytes(4).toString('hex'),
          Tty: true,
          Cmd: ['/bin/bash'],
        });
        await container.start();
        containerIdOrName = container.id;
        console.log('✅ New container started:', containerIdOrName);
      } catch (createErr) {
        console.error('❌ Failed to create or start container:', createErr);
        socket.emit('output', { terminalId, data: 'Error: Failed to create or start new container.\r\n' });
        return;
      }
    }

    // Kill existing process if same terminalId is reused for some reason
    if (ptyProcesses.has(terminalId)) {
      ptyProcesses.get(terminalId).kill();
    }

    const ptyProcess = pty.spawn('docker', ['exec', '-u', 'root', '-it', containerIdOrName, '/bin/bash'], {
      name: 'xterm-color',
      cols: 80,
      rows: 12,
      cwd: process.env.HOME,
      env: process.env,
    });

    console.log(`🔥 PTY session started for terminal: ${terminalId} in container: ${containerIdOrName}`);

    ptyProcesses.set(terminalId, ptyProcess);

    ptyProcess.on('data', (data) => {
      socket.emit('output', { terminalId, data });
    });

    ptyProcess.on('exit', () => {
      ptyProcesses.delete(terminalId);
    });
  });

  socket.on('input', ({ terminalId, data }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess) {
      try {
        ptyProcess.write(data);
      } catch (err) {
        console.error(`Error writing to PTY ${terminalId}:`, err);
      }
    }
  });

  socket.on('resize', ({ terminalId, cols, rows }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess && cols && rows) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        console.error(`Error resizing PTY ${terminalId}:`, err);
      }
    }
  });

  socket.on('terminal-resize', ({ terminalId, cols, rows }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess && cols && rows) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        console.error(`Error resizing PTY ${terminalId}:`, err);
      }
    }
  });

  socket.on('closeTerminal', ({ terminalId }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess) {
      console.log(`Closing terminal session: ${terminalId}`);
      ptyProcess.kill();
      ptyProcesses.delete(terminalId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected, cleaning up terminals for socket:', socket.id);
    ptyProcesses.forEach((ptyProcess, terminalId) => {
      ptyProcess.kill();
    });
    ptyProcesses.clear();
  });
};
