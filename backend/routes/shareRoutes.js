import express from 'express';
import { 
  shareRepo, 
  getSharedUsers, 
  getSharedUsersByVmId, 
  getSharedRepos 
} from '../controllers/shareController.js';

const router = express.Router();

// Protected routes (will be prefixed with /protected in main router)
router.post('/share-repo', shareRepo);
router.get('/get-shared-users/:id', getSharedUsers);
router.get('/get-shared-repos', getSharedRepos);

// Public route for shared users list by vmId
router.get('/:vmId/users', getSharedUsersByVmId); 

export default router;
