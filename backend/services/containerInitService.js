import docker from '../config/docker.js';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * Initializes a container in the background.
 * Checks for a marker file and performs setup if missing.
 */
export const initializeVM = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    
    // 1. Ensure container is running
    const info = await container.inspect();
    if (!info.State.Running) {
      console.log(`🚀 Starting stopped VM ${containerId}...`);
      await container.start();
    }
    
    // 2. Check if already initialized
    const checkExec = await container.exec({
      Cmd: ['ls', '/.initialized'],
      AttachStdout: true,
      AttachStderr: true
    });
    
    const checkStream = await checkExec.start();
    // Consume the stream to wait for the command to finish
    await new Promise((resolve, reject) => {
      checkStream.on('data', () => {}); // We don't need the output, just consume it
      checkStream.on('end', resolve);
      checkStream.on('error', reject);
    });
    
    const { ExitCode } = await checkExec.inspect();
    if (ExitCode === 0) {
      console.log(`ℹ️ VM ${containerId} already initialized.`);
      return;
    }

    // 3. Perform background setup
    console.log(`🚀 Initializing VM ${containerId} in background...`);
    const initScript = `
      # Create initialized marker
      touch /.initialized && \
      # Set up local environment if needed
      echo "✅ VM Initialization Complete"
    `;

    const execInstance = await container.exec({
      Cmd: ['bash', '-c', initScript],
      AttachStdout: false,
      AttachStderr: false,
      Tty: false
    });

    await execInstance.start();
    console.log(`✅ Background initialization triggered for VM ${containerId}`);

  } catch (err) {
    console.error(`❌ VM initialization failed for ${containerId}:`, err.message);
  }
};
