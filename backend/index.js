import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

import connectDB from './config/db.js';
import initSocket from './socket/index.js';
import cookieParser from 'cookie-parser';
import initRoutes from './routes/index.js';
import { handlePortProxy, handlePortProxyUpgrade } from './middleware/portProxy.js';
import { handleFallbackProxy } from './middleware/fallbackProxy.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temporary directories exist
const tmpDir = path.join(__dirname, 'tmp');
const uploadsDir = path.join(__dirname, 'uploads');
const tempUploadDir = path.join(__dirname, 'temp_upload');

[tmpDir, uploadsDir, tempUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();
const server = http.createServer(app);

// Initialize Sockets
const io = initSocket(server);

// Handle WebSocket upgrades for Port Proxy
server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/proxy')) {
    handlePortProxyUpgrade(req, socket, head);
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.all(['/proxy/:vmId/:port', '/proxy/:vmId/:port/*path'], handlePortProxy);
app.use(express.json());

// Initialize Routes
app.use('/', initRoutes(io));

// Fallback for absolute paths from VM apps
app.use(handleFallbackProxy);

// Database Connection
connectDB();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
