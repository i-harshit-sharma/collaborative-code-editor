import docker from '../config/docker.js';
import User from '../models/User.js';
import { jwtDecode } from 'jwt-decode';

export const cloneRepo = async (req, res) => {
  let language = 'python';
  let type = 'public';
  const { url, repoName } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);

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

    const user = await User.findOne({ userId: payload.sub });
    if (!user) {
      const newUser = new User({ userId: payload.sub, repos: [] });
      await newUser.save();
      newUser.repos.push({ repoName, language, type, vmId: container.id, sharedUsers: [] });
      newUser.repos[0].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
      await newUser.save();
    } else {
      user.repos.push({ repoName, language, type, vmId: container.id, sharedUsers: [] });
      user.repos[user.repos.length - 1].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
      await user.save();
    }
    res.json({ message: "Repository successfully cloned into Docker volume." });
  } catch (err) {
    console.error("Clone error:", err);
    res.status(500).json({ error: err.message });
  }
};
