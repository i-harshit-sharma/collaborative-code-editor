import User from '../models/User.js';
import { jwtDecode } from 'jwt-decode';
import { createContainerFromImages } from '../services/dockerService.js';
import { getSharedUserIdsByVmId } from '../services/repoService.js';

export const getRepos = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);

  User.findOne({ userId: payload.sub })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user.repos);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    });
};

export const createRepo = async (req, res) => {
  const { repoName, language, type } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);
  let containerId = "1234"; 

  const imageList = [
    { cpp: 'ubuntu' },
    { node: 'my-node-image' },
    { python: 'my-conda-python-image' }
  ];

  try {
    containerId = await createContainerFromImages(imageList, language);
  } catch (err) {
    console.error('Failed to create container:', err.message);
  }

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    const newUser = new User({ userId: payload.sub, repos: [] });
    await newUser.save();
    newUser.repos.push({ repoName, language, type, vmId: containerId, sharedUsers: [] });
    newUser.repos[0].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
    await newUser.save();
    res.json({ message: 'Repository created successfully', user: newUser });
  } else {
    user.repos.push({ repoName, language, type, vmId: containerId, sharedUsers: [] });
    user.repos[user.repos.length - 1].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
    await user.save();
    res.json({ message: 'Repository created successfully', user });
  }
};

export const deleteRepo = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.repos = user.repos.filter((repo) => repo._id.toString() !== id);
  await user.save();
  res.json({ message: 'Repository deleted successfully', user });
};

export const editRepo = async (req, res) => {
  try {
    const { id, obj } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token found' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwtDecode(token);

    const user = await User.findOne({ userId: payload.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const repo = user.repos.id(id);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    if (obj.repoName) repo.repoName = obj.repoName;
    if (obj.language) repo.language = obj.language;
    if (obj.type) repo.type = obj.type;

    await user.save();
    res.json({ message: 'Repository edited successfully', user });
  } catch (error) {
    console.error('Edit repo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkRepo = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const users = await getSharedUserIdsByVmId(id);
  if (users.find(user => user === payload.sub)) {
    return res.status(200).json({ message: 'User has access' });
  }

  return res.status(403).json({ message: 'User does not have access' });
};
