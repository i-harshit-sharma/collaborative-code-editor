import docker from '../config/docker.js';
import pty from '@lydell/node-pty';
import { randomBytes } from 'crypto';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export default (io, socket) => {
  const ptyProcesses = new Map();

  socket.on('sendToken', async ({ containerId, terminalId }) => {
    logger.debug(`Terminal token received: container=${containerId}, terminal=${terminalId}`);

    if (!terminalId) {
      logger.error('Missing terminalId in sendToken');
      return;
    }

    const userId = socket.data.userId;
    if (!userId) {
      logger.error(`Unauthorized terminal access attempt by socket ${socket.id}`);
      socket.emit('output', { terminalId, data: 'Error: Unauthorized.\r\n' });
      return;
    }

    let user;
    try {
      user = await User.findOne({ userId });
    } catch (err) {
      logger.error(`Database lookup error for user ${userId}: ${err.message}`);
      socket.emit('output', { terminalId, data: 'Error: Database error.\r\n' });
      return;
    }
    
    if (!user) {
      logger.error(`User profile not found in DB for ID: ${userId}`);
      socket.emit('output', { terminalId, data: 'Error: User profile not found.\r\n' });
      return;
    }

    let container = docker.getContainer(containerId);
    let containerIdOrName = containerId;
    try {
      const info = await container.inspect();
      if (!info.State.Running) {
        await container.start();
        logger.info(`🚀 Started existing container: ${containerIdOrName}`);
      }
    } catch (err) {
      logger.info(`ℹ️ Container ${containerIdOrName} not found or not running, creating a new one`);
      try {
        container = await docker.createContainer({
          Image: 'ubuntu',
          name: randomBytes(4).toString('hex'),
          Tty: true,
          Cmd: ['/bin/bash'],
        });
        await container.start();
        containerIdOrName = container.id;
        logger.success(`✅ New container started: ${containerIdOrName}`);
      } catch (createErr) {
        logger.error(`❌ Failed to create or start container: ${createErr.message}`);
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

    logger.info(`🔥 PTY session started for terminal: ${terminalId} (User: ${socket.data.username})`);

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
        logger.error(`Error writing to PTY ${terminalId}: ${err.message}`);
      }
    }
  });

  socket.on('resize', ({ terminalId, cols, rows }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess && cols && rows) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        logger.error(`Error resizing PTY ${terminalId}: ${err.message}`);
      }
    }
  });

  socket.on('terminal-resize', ({ terminalId, cols, rows }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess && cols && rows) {
      try {
        ptyProcess.resize(cols, rows);
      } catch (err) {
        logger.error(`Error resizing PTY ${terminalId}: ${err.message}`);
      }
    }
  });

  socket.on('closeTerminal', ({ terminalId }) => {
    const ptyProcess = ptyProcesses.get(terminalId);
    if (ptyProcess) {
      logger.info(`🚪 Closing terminal session: ${terminalId}`);
      ptyProcess.kill();
      ptyProcesses.delete(terminalId);
    }
  });

  socket.on('disconnect', () => {
    if (ptyProcesses.size > 0) {
      logger.info(`🧹 Cleanup: Closing ${ptyProcesses.size} terminal sessions for socket: ${socket.id}`);
      ptyProcesses.forEach((ptyProcess, terminalId) => {
        ptyProcess.kill();
      });
      ptyProcesses.clear();
    }
  });
};
