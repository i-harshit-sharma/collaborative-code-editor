import docker from '../config/docker.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const cloneRepo = async (req, res) => {
  let language = 'python';
  let type = 'public';
  const { url, repoName } = req.body;
  const authId = req.authId;
  let user = req.user;

  const volumeName = "repos_data";

  try {
    try {
      await docker.getVolume(volumeName).inspect();
    } catch {
      await docker.createVolume({ Name: volumeName });
    }

    await new Promise((resolve, reject) => {
      docker.pull("alpine/git:latest", (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err) {
          err ? reject(err) : resolve();
        }
        function onProgress() {}
      });
    });

    const container = await docker.createContainer({
      Image: "alpine/git:latest",
      Cmd: ["clone", url, "/app"],
      HostConfig: {
        Binds: [`${volumeName}:/app`],
        AutoRemove: true,
      },
    });

    await container.start();
    await container.wait();

    if (!user) {
      user = new User({ userId: authId, repos: [] });
    }
    
    user.repos.push({ repoName, language, type, vmId: container.id, sharedUsers: [] });
    user.repos[user.repos.length - 1].sharedUsers.push({ userId: authId, role: 'Owner' });
    await user.save();
    
    logger.success(`🚀 Repository successfully cloned: ${repoName} from ${url}`);
    
    res.json({ message: "Repository successfully cloned into Docker volume." });
  } catch (err) {
    logger.error(`Clone error for ${url}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
