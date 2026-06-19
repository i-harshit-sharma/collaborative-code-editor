import User from '../models/User.js';

export const getSharedReposForUser = async (targetUserId) => {
  try {
    const usersWithSharedRepos = await User.find(
      { "repos.sharedUsers.userId": targetUserId },
      {
        repos: {
          $filter: {
            input: "$repos",
            as: "repo",
            cond: {
              $in: [targetUserId, "$$repo.sharedUsers.userId"]
            }
          }
        },
        userId: 1
      }
    );

    const sharedRepos = usersWithSharedRepos.flatMap(user =>
      user.repos.filter(repo =>
        repo.sharedUsers.some(shared => shared.userId === targetUserId)
      ).map(repo => ({
        repoName: repo.repoName,
        owner: user.userId,
        role: repo.sharedUsers.find(u => u.userId === targetUserId)?.role,
        language: repo.language,
        type: repo.type,
        vmId: repo.vmId,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
      }))
    );

    return sharedRepos;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getSharedUserIdsByVmId = async (vmId) => {
  try {
    const users = await User.find({
      "repos.vmId": vmId
    }, {
      "repos.$": 1
    });

    const sharedUserIds = [];

    users.forEach(user => {
      user.repos.forEach(repo => {
        if (repo.vmId === vmId && repo.sharedUsers) {
          repo.sharedUsers.forEach(sharedUser => {
            sharedUserIds.push(sharedUser.userId);
          });
        }
      });
    });

    return sharedUserIds;
  } catch (error) {
    console.error("Error fetching shared users:", error);
    throw error;
  }
};

export const getUserRoleForVm = async (userId, vmId) => {
  try {
    const ownerDoc = await User.findOne({ "repos.vmId": vmId });
    if (!ownerDoc) return null;
    const repo = ownerDoc.repos.find(r => r.vmId === vmId);
    if (!repo) return null;

    // Check if the user is in sharedUsers
    const sharedUser = repo.sharedUsers.find(u => u.userId === userId);
    if (sharedUser) {
      return sharedUser.role; // 'Owner', 'Editor', or 'Viewer'
    }

    // If not explicitly shared, check if public / Anyone with the Link
    if (repo.access === "Anyone with the Link") {
      return repo.action || 'Viewer';
    }

    return null; // No access
  } catch (error) {
    console.error("Error in getUserRoleForVm:", error);
    return null;
  }
};

