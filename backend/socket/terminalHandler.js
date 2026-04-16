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

    const installScript = `
export DEBIAN_FRONTEND=noninteractive && \
apt-get update && \
apt-get install -y \
  gcc make build-essential git curl wget unzip zsh tmux nano neofetch tzdata vim locales && \
ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
dpkg-reconfigure --frontend noninteractive tzdata && \
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  tee /etc/apt/sources.list.d/ngrok.list && \
apt update && apt install -y ngrok && \
ngrok config add-authtoken YOUR_NGROK_TOKEN && \
echo "✅ Installed development tools and configured tzdata"
`;
    ptyProcess.write(`${installScript}\n`);

    ptyProcess.on('data', (data) => {
      socket.emit('output', { data });
    });

    socket.on('input', (data) => {
      ptyProcess.write(data);
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      ptyProcess.kill();
      io.sockets.adapter.rooms.get(containerIdOrName)?.delete(socket.id);
      if (io.sockets.adapter.rooms.get(containerIdOrName)?.size === 0) {
        console.log("No more clients in the room, stopping container");
        try {
          await container.stop();
          console.log(`Container ${containerIdOrName} stopped.`);
        } catch (stopErr) {
          console.error(`Failed to stop container ${containerIdOrName}:`, stopErr);
        }
      }
    });
  });
};
