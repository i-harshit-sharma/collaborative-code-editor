import express from 'express';
import { searchFiles } from '../controllers/searchController.js';

const router = express.Router();

router.get('/search', searchFiles);

export default router;
