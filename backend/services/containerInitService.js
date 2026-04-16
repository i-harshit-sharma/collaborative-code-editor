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
    
    // 1. Check if already initialized
    const checkCmd = `docker exec ${containerId} ls /app/.initialized`;
    try {
      await execPromise(checkCmd);
      console.log(`ℹ️ VM ${containerId} already initialized.`);
      return;
    } catch (err) {
      // Marker file not found, proceed with init
      console.log(`🚀 Initializing VM ${containerId} in background...`);
    }

    // 2. Perform background setup
    // We run this in the background using docker.exec or child_process
    // We'll use a single block to minimize overhead
    const initScript = `
      # Create initialized marker
      touch /app/.initialized && \
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
