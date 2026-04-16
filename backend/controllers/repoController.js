import User from '../models/User.js';
import { jwtDecode } from 'jwt-decode';
import { createContainerFromImages } from '../services/dockerService.js';
import { getSharedUserIdsByVmId } from '../services/repoService.js';
import { initializeVM } from '../services/containerInitService.js';

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
  let containerId = null;

  // Map framework/language to the specific Docker image name from executionImages.js
  const imageMapping = {
    'python': 'code-collab-python-executor',
    'javascript': 'code-collab-node-executor',
    'typescript': 'code-collab-node-executor',
    'cpp': 'code-collab-cpp-executor',
    'java': 'code-collab-java-executor',
    'flask': 'code-collab-python-flask-executor',
    'fastapi': 'code-collab-python-fastapi-executor',
    'django': 'code-collab-python-django-executor',
    'express': 'code-collab-node-express-executor',
    'react-vite': 'code-collab-node-vite-react-executor',
    'spring-boot': 'code-collab-java-spring-boot-executor',
    'cpp-cmake': 'code-collab-cpp-cmake-executor',
    'bare': 'code-collab-bare-machine-executor'
  };

  const imageName = imageMapping[language];
  
  if (!imageName) {
    return res.status(400).json({ 
      error: `Unsupported template: ${language}. Please select a valid framework from the list.` 
    });
  }

  try {
    // We pass a simplified imageList to createContainerFromImages
    // or just modify createContainerFromImages to accept a single string if that's easier.
    // For now, let's stick to the current signature or slightly adapt it.
    containerId = await createContainerFromImages([{ [language]: imageName }], language);
  } catch (err) {
    console.error('Failed to create container:', err.message);
    return res.status(500).json({ error: 'Failed to provision VM: ' + err.message });
  }

  // Trigger background initialization
  initializeVM(containerId).catch(err => console.error('Init trigger error:', err));

  try {
    let user = await User.findOne({ userId: payload.sub });
    if (!user) {
      user = new User({ userId: payload.sub, repos: [] });
    }

    const newRepo = {
      repoName,
      language,
      type: type === 'public' ? 'Public' : 'Private', // Normalize case
      vmId: containerId,
      sharedUsers: [{ userId: payload.sub, role: 'Owner' }]
    };

    user.repos.push(newRepo);
    await user.save();

    // Find the newly pushed repo to get its _id and full object
    const createdRepo = user.repos[user.repos.length - 1];

    res.json({
      message: 'Repository created successfully',
      repo: createdRepo
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to save repository to database' });
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
    // Ensure VM is initialized when user enters
    initializeVM(id).catch(err => console.error('Init trigger error:', err));
    return res.status(200).json({ message: 'User has access' });
  }

  return res.status(403).json({ message: 'User does not have access' });
};
