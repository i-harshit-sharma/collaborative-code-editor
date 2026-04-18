import Docker from 'dockerode';
import fs from 'fs';

const docker = new Docker();

/**
 * Check if the current process is running inside a Docker container.
 */
export const isRunningInDocker = () => {
  try {
    return fs.existsSync('/.dockerenv');
  } catch (err) {
    return false;
  }
};

/**
 * Get the name of the network the current container is joined to.
 * This is useful in Docker-in-Docker environments like Coolify.
 */
export const getBackendNetwork = async () => {
  if (!isRunningInDocker()) return null;

  try {
    // Try to get our own container ID
    const cgroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
    const match = cgroup.match(/^\d+:.+:\/docker\/([a-f0-9]+)$/m);
    if (match) {
      const containerId = match[1];
      const container = docker.getContainer(containerId);
      const info = await container.inspect();
      const networks = Object.keys(info.NetworkSettings.Networks);
      return networks[0] || null; // Usually there is at least one
    }
  } catch (err) {
    console.warn('Could not determine backend network:', err.message);
  }
  return null;
};

export default docker;
