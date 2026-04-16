import User from '../models/User.js';
import { jwtDecode } from 'jwt-decode';
import { clerkClient } from '../config/clerk.js';
import { getSharedReposForUser } from '../services/repoService.js';

export const shareRepo = async (req, res) => {
  try {
    const { id, obj } = req.body;
    const userList = await clerkClient.users.getUserList({ emailAddress: obj.email });
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

    let repo = user.repos.id(id);
    if (!repo) {
      repo = user.repos.find((repo) => repo.vmId === id);
      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      }
    }
    const userId = userList.data[0].id;
    repo.access = obj.shareConfig[0];
    repo.action = obj.shareConfig[1];
    if (!obj.email) {
      await user.save();
      return res.status(400).json({ error: 'Email is required' });
    }
    if (repo.sharedUsers.find(user => user.userId === userId)) {
      repo.sharedUsers = repo.sharedUsers.filter((user) => user.userId !== userId);
    }
    repo.sharedUsers.push({ userId: userId, role: obj.role });
    await user.save();
    res.json(repo);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSharedUsers = async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const userList = await clerkClient.users.getUserList();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

  const users = repo.sharedUsers;
  let sharedUsers = [];

  for (const user of users) {
    const foundUser = userList.data.find(u => u.id === user.userId);
    if (foundUser) sharedUsers.push({ raw: foundUser._raw, role: user.role });
  }

  res.json({ sharedUsers, access: repo.access, action: repo.action, vmId: repo.vmId });
};

export const getSharedUsersByVmId = async (req, res) => {
  const { vmId } = req.params;
  const userList = await clerkClient.users.getUserList();

  try {
    const userDoc = await User.findOne(
      { 'repos.vmId': vmId },
      { 'repos.$': 1 }
    ).lean();

    if (!userDoc || !userDoc.repos || userDoc.repos.length === 0) {
      return res.status(404).json({ message: 'VM not found' });
    }
    const sharedUsers = userDoc.repos[0].sharedUsers;
    let users = [];
    for (const sharedUser of sharedUsers) {
      const user = userList.data.find(user => user.id === sharedUser.userId);
      if (user) {
        users.push({ 
          name: user.firstName + " " + user.lastName, 
          role: sharedUser.role, 
          img: user.imageUrl 
        });
      }
    }
    return res.json({ users });
  } catch (err) {
    console.error('Error fetching sharedUsers:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getSharedRepos = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1];
  const payload = jwtDecode(token);

  const repos = await getSharedReposForUser(payload.sub);
  if (!repos) {
    return res.status(404).json({ error: 'No shared repos found' });
  }

  res.json(repos.filter(repo => repo.owner !== payload.sub));
};
