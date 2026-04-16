import docker from '../config/docker.js';

const SHUTDOWN_TIMEOUT = 60 * 1000; // 60 seconds
const pendingShutdowns = new Map();

/**
 * Marks a VM as active, clearing any pending shutdown timers.
 */
export const markVMActive = (vmId) => {
  if (pendingShutdowns.has(vmId)) {
    console.log(`📡 Activity detected in VM ${vmId}. Cancelling shutdown.`);
    clearTimeout(pendingShutdowns.get(vmId));
    pendingShutdowns.delete(vmId);
  }
};

/**
 * Checks the occupancy of a room and schedules a shutdown if it's empty.
 */
export const checkAndScheduleShutdown = (io, vmId) => {
  const room = io.sockets.adapter.rooms.get(vmId);
  const occupancy = room ? room.size : 0;

  console.log(`📊 VM ${vmId} occupancy: ${occupancy}`);

  if (occupancy === 0) {
    if (!pendingShutdowns.has(vmId)) {
      console.log(`⏲️ No active users in VM ${vmId}. Scheduling shutdown in ${SHUTDOWN_TIMEOUT / 1000}s.`);
      
      const timer = setTimeout(async () => {
        await shutdownContainer(vmId);
        pendingShutdowns.delete(vmId);
      }, SHUTDOWN_TIMEOUT);
      
      pendingShutdowns.set(vmId, timer);
    }
  } else {
    markVMActive(vmId);
  }
};

/**
 * Safely stops the Docker container.
 */
const shutdownContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    if (info.State.Running) {
      console.log(`🛑 Stopping container ${containerId}...`);
      await container.stop();
      console.log(`✅ Container ${containerId} stopped successfully.`);
    } else {
      console.log(`ℹ️ Container ${containerId} is already stopped.`);
    }
  } catch (err) {
    if (err.statusCode === 404) {
      console.log(`ℹ️ Container ${containerId} not found (likely already removed).`);
    } else {
      console.error(`❌ Failed to stop container ${containerId}:`, err.message);
    }
  }
};
