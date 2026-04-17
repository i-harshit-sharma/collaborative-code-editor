import User from '../models/User.js';
import { jwtDecode } from 'jwt-decode';
import { createContainerFromImages } from '../services/dockerService.js';
import { getSharedUserIdsByVmId } from '../services/repoService.js';
import { initializeVM } from '../services/containerInitService.js';
import { vmTemplates } from '../config/vmTemplates.js';

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

  const imageConfig = vmTemplates[language];
  const imageName = imageConfig?.image;
  
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

/**
 * Get VM metadata (language, default ports, etc.) by vmId
 */
export const getVmMetadata = async (req, res) => {
  const { vmId } = req.params;

  try {
    const user = await User.findOne({ "repos.vmId": vmId });
    if (!user) {
      return res.status(404).json({ error: 'VM not found' });
    }

    const repo = user.repos.find(r => r.vmId === vmId);
    if (!repo) {
      return res.status(404).json({ error: 'VM not found in user repos' });
    }

    const template = vmTemplates[repo.language] || {};
    
    res.json({
      language: repo.language,
      repoName: repo.repoName,
      defaultPorts: template.ports || [3000, 5000, 8000, 8080]
    });
  } catch (err) {
    console.error('Failed to get VM metadata:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
