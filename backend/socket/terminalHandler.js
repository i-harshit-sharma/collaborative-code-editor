import { jwtDecode } from 'jwt-decode';
import docker from '../config/docker.js';
import pty from '@lydell/node-pty';
import { randomBytes } from 'crypto';
import User from '../models/User.js';

export default (io, socket) => {
  socket.on('sendToken', async ({ token, containerId }) => {
    console.log('Received containerId:', containerId);

    let payload;
    try {
      payload = jwtDecode(token);
    } catch (err) {
      console.error('Invalid token:', err);
      socket.emit('output', 'Error: Invalid token.');
      return;
    }

    let user;
    try {
      user = await User.findOne({ userId: payload.sub });
    } catch (err) {
      console.error('Database lookup error:', err);
      socket.emit('output', 'Error: Database error.');
      return;
    }
    if (!user) {
      console.error('User not found in DB:', payload.sub);
      socket.emit('output', 'Error: User not found.');
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
        socket.emit('output', 'Error: Failed to create or start new container.');
        return;
      }
    }

    const ptyProcess = pty.spawn('docker', ['exec', '-u', 'root', '-it', containerIdOrName, '/bin/bash'], {
      name: 'xterm-color',
      cols: 80,
      rows: 12,
      cwd: process.env.HOME,
      env: process.env,
    });

    console.log('🔥 PTY session started for container:', containerIdOrName);

    console.log('🔥 PTY session started for container:', containerIdOrName);

    ptyProcess.on('data', (data) => {
      socket.emit('output', { data });
    });

    socket.on('input', (data) => {
      ptyProcess.write(data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from terminal:', socket.id);
      ptyProcess.kill();
      // The global 'disconnecting' listener in index.js handles container shutdown
    });
  });
};
