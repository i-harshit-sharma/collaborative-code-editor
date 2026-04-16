import express from 'express';
import { 
  getRepos, 
  createRepo, 
  deleteRepo, 
  editRepo, 
  checkRepo 
} from '../controllers/repoController.js';

const router = express.Router();

router.get('/get-repos', getRepos);
router.post('/create-repo', createRepo);
router.delete('/delete-repo/:id', deleteRepo);
router.post('/edit-repo', editRepo);
router.get('/check-repo/:id', checkRepo);

export default router;
