import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import executeRoutes from './executeRoutes.js';
import repoRoutes from './repoRoutes.js';
import shareRoutes from './shareRoutes.js';
import cloneRoutes from './cloneRoutes.js';
import searchRoutes from './searchRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = express.Router();

export default (io) => {
  // Public routes
  router.use('/api', executeRoutes);
  router.use('/api', cloneRoutes);
  router.use('/', searchRoutes);
  router.use('/', uploadRoutes(io));

  // Protected routes
  router.use('/protected', clerkMiddleware(), repoRoutes);
  router.use('/protected', clerkMiddleware(), shareRoutes);
  
  // Public VM user list (extracted from share routes logic)
  router.use('/vm', shareRoutes); 

  // Simple test routes
  router.get('/test', (req, res) => res.send('Test Successful!'));
  router.get('/protected/test', clerkMiddleware(), (req, res) => res.send('Protected Test Successful!'));

  return router;
};
