import User from '../models/User.js';
import { createContainerFromImages } from '../services/dockerService.js';
import { getSharedUserIdsByVmId } from '../services/repoService.js';
import { initializeVM } from '../services/containerInitService.js';
import { vmTemplates } from '../config/vmTemplates.js';
import logger from '../utils/logger.js';

export const getRepos = async (req, res) => {
  const user = req.user;
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user.repos);
};

export const createRepo = async (req, res) => {
  const { repoName, language, type } = req.body;
  const userId = req.authId; // Provided by authMiddleware
  let user = req.user;

  let containerId = null;

  const imageConfig = vmTemplates[language];
  const imageName = imageConfig?.image;
  
  if (!imageName) {
    return res.status(400).json({ 
      error: `Unsupported template: ${language}. Please select a valid framework from the list.` 
    });
  }

  try {
    containerId = await createContainerFromImages([{ [language]: imageName }], language);
  } catch (err) {
    logger.error(`Failed to create container: ${err.message}`);
    return res.status(500).json({ error: 'Failed to provision VM: ' + err.message });
  }

  // Trigger background initialization
  initializeVM(containerId).catch(err => logger.error(`Init trigger error: ${err.message}`));

  try {
    if (!user) {
      user = new User({ userId: userId, repos: [] });
    }

    const newRepo = {
      repoName,
      language,
      type: type === 'public' ? 'Public' : 'Private', // Normalize case
      vmId: containerId,
      sharedUsers: [{ userId: userId, role: 'Owner' }]
    };

    user.repos.push(newRepo);
    await user.save();
    
    logger.success(`📁 Repository created: ${repoName} (VM: ${containerId})`);

    // Find the newly pushed repo to get its _id and full object
    const createdRepo = user.repos[user.repos.length - 1];

    res.json({
      message: 'Repository created successfully',
      repo: createdRepo
    });
  } catch (err) {
    logger.error(`Database error during repo creation: ${err.message}`);
    res.status(500).json({ error: 'Failed to save repository to database' });
  }
};

export const deleteRepo = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

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
    const user = req.user;

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
    logger.error(`Edit repo error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkRepo = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const authId = req.authId;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const users = await getSharedUserIdsByVmId(id);
  if (users.find(uId => uId === authId)) {
    // Ensure VM is initialized when user enters
    initializeVM(id).catch(err => logger.error(`Init trigger error: ${err.message}`));
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
    logger.error(`Failed to get VM metadata for ${vmId}: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};
