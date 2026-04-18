import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import executeRoutes from './executeRoutes.js';
import repoRoutes from './repoRoutes.js';
import shareRoutes from './shareRoutes.js';
import cloneRoutes from './cloneRoutes.js';
import path from 'path';
import fs from 'fs-extra';
import mongoose from 'mongoose';
import docker from '../config/docker.js';
import { executionImages } from '../config/executionImages.js';
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

  // Healthcheck route
  router.get('/health', async (req, res) => {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      dockerDaemon: 'unknown',
      dockerFiles: 'unknown',
    };

    try {
      // Check MongoDB
      const dbStatus = mongoose.connection.readyState;
      healthStatus.database = dbStatus === 1 ? 'connected' : 'disconnected';
      if (dbStatus !== 1) healthStatus.status = 'error';

      // Check Docker Daemon
      try {
        await docker.ping();
        healthStatus.dockerDaemon = 'reachable';
      } catch (err) {
        healthStatus.dockerDaemon = `unreachable: ${err.message}`;
        healthStatus.status = 'error';
      }

      // Check Dockerfiles
      const missingFiles = [];
      executionImages.forEach(img => {
        if (img.dockerfile) {
          // Resolve path relative to project root (backend folder)
          const filePath = path.resolve(img.dockerfile);
          if (!fs.existsSync(filePath)) {
            missingFiles.push(img.dockerfile);
          }
        }
      });

      if (missingFiles.length === 0) {
        healthStatus.dockerFiles = 'all present';
      } else {
        healthStatus.dockerFiles = `missing: ${missingFiles.join(', ')}`;
        healthStatus.status = 'error';
      }

      const statusCode = healthStatus.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (err) {
      res.status(500).json({ 
        status: 'error', 
        message: err.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
};
