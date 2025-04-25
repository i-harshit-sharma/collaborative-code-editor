const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import { jwtDecode } from 'jwt-decode'
import { exec } from 'child_process';
import mongoose from 'mongoose'
import { createClerkClient } from '@clerk/express'
import Docker from 'dockerode';
import pty from '@lydell/node-pty';
import { randomBytes } from 'crypto';
import { Server } from 'socket.io';
import http from 'http';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const upload = multer({ dest: "uploads/" });


dotenv.config();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

import User from './models/User.js';

const docker = new Docker();

const app = express();

// Allow your React app (running on localhost:3000) to talk to this server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

async function createContainerFromImages(imageList, language) {
  for (const imageObj of imageList) {
    const imageName = imageObj[language];
    if (!imageName) continue;

    try {

      const container = await docker.createContainer({
        Image: imageName,
        Cmd: ['bash'],
        Tty: true,
      });

      console.log(`Container created from image "${imageName}"`);
      return container.id;
    } catch (err) {
      console.warn(`Failed with image "${imageName}": ${err.message}`);
    }
  }

  throw new Error('None of the images could be used to create a container.');
}



const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');

  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
  }
};
startServer();


app.use('/protected', clerkMiddleware());

app.get('/protected/test', (req, res) => {
  res.send(' Protected Test Successful!');
});

app.get('/test', (req, res) => {
  res.send('Test Successful!');
});


app.post("/upload", upload.array("files"), async (req, res) => {
  const files = req.files;
  const containerId = req.body.containerId;
  console.log(containerId);
  const targetPath = "/app";

  try {
    for (const file of files) {
      const destPath = path.join("temp_upload", file.originalname);
      await fs.move(file.path, destPath, { overwrite: true });

      // Copy file into the Docker container's /app folder
      console.log("Updating container with file:", `docker cp ${destPath} ${containerId}:${targetPath}`);
      exec(`docker cp ${destPath} ${containerId}:${targetPath}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error copying file to Docker: ${stderr}`);
        }
      });
      io.emit('filesReady', 'files are ready to be read');
    }

    res.status(200).send("Files transferred to container");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to upload files");
  }
});

app.get('/protected/get-repos', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '

  const payload = jwtDecode(token);

  console.log('Decoded Token Payload:', payload.sub);
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
})

app.post('/protected/create-repo', async (req, res) => {
  const { repoName, language, type } = req.body;
  console.log(repoName, language, type)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '

  const payload = jwtDecode(token);
  let containerId = "1234"; // Initialize containerId to null
  const imageList = [
    { cpp: 'ubuntu' },
    { node: 'my-node-image' },
    { python: 'my-conda-python-image' }
  ];
  try {
    containerId = await createContainerFromImages(imageList, language);
    console.log(`Container created with ID: ${containerId}`);
  } catch (err) {
    console.error('Failed to create container:', err.message);
  }
  console.log(containerId)
  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    const newUser = new User({ userId: payload.sub, repos: [] });
    await newUser.save();
    newUser.repos.push({ repoName, language, type, vmId: containerId, sharedUsers: [] });
    newUser.repos[0].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
    await newUser.save();

  }
  else {
    user.repos.push({ repoName, language, type, vmId: containerId, sharedUsers: [] });
    user.repos[user.repos.length - 1].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
    await user.save();
  }

  console.log('New repository created:', { repoName, language, type });
  res.json({ message: 'Repository created successfully', user });
})

app.delete('/protected/delete-repo/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '

  const payload = jwtDecode(token);

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.repos = user.repos.filter((repo) => repo._id.toString() !== id);
  await user.save();
  console.log('Repository deleted:', id);
  res.json({ message: 'Repository deleted successfully', user });
})


app.post('/protected/edit-repo/', async (req, res) => {
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

    // Update only allowed fields
    if (obj.repoName) repo.repoName = obj.repoName;
    if (obj.language) repo.language = obj.language;
    if (obj.type) repo.type = obj.type;

    await user.save();

    console.log('Repository edited:', id);
    res.json({ message: 'Repository edited successfully', user });
  } catch (error) {
    console.error('Edit repo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/protected/share-repo/', async (req, res) => {
  try {
    const { id, obj } = req.body;
    console.log(id, obj);
    const userList = await clerkClient.users.getUserList({ emailAddress: obj.email })
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
    const emailAddress = userList.data[0].emailAddresses[0].emailAddress;
    repo.sharedUsers.push({ userId: userId, role: obj.role });
    await user.save();
    res.json(repo);
  } catch (error) {
    console.log(error.message)
  }
});

app.post("/api/clone", async (req, res) => {
  let language = 'python'
  let type = 'public';
  console.log("started")
  const { url, repoName } = req.body;
  // if (!url || !/^https?:\/\/.+\.git$/.test(url)) {
  //   return res.status(400).json({ error: "Invalid Git URL" });
  // }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  console.log(authHeader)
  const token = authHeader.split(' ')[1]; // remove 'Bearer '
  const payload = jwtDecode(token);

  console.log("Payload:", payload);

  const volumeName = "repos_data";

  try {
    // 1. Ensure volume exists
    try {
      await docker.getVolume(volumeName).inspect();
    } catch {
      await docker.createVolume({ Name: volumeName });
    }

    // 2. Pull the git image (if not on host)
    await new Promise((resolve, reject) => {
      docker.pull("alpine/git:latest", (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err) {
          err ? reject(err) : resolve();
        }
        function onProgress() {
          /* you could log progress here */
        }
      });
    });

    // 3. Create the container
    const container = await docker.createContainer({
      Image: "alpine/git:latest",
      Cmd: ["clone", url, "/app"],
      HostConfig: {
        Binds: [`${volumeName}:/app`],   // mount named volume → /app
        AutoRemove: true,                 // clean up when done
      },
    });

    // 4. Start & wait for it to finish
    await container.start();
    await container.wait();


    console.log("Clone operation completed successfully.");
    console.log(container)
    const user = await User.findOne({ userId: payload.sub });
    if (!user) {
      const newUser = new User({ userId: payload.sub, repos: [] });
      await newUser.save();
      newUser.repos.push({ repoName, language, type, vmId: container.id, sharedUsers: [] });
      newUser.repos[0].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
      await newUser.save();

    }
    else {
      user.repos.push({ repoName, language, type, vmId: container.id, sharedUsers: [] });
      user.repos[user.repos.length - 1].sharedUsers.push({ userId: payload.sub, role: 'Owner' });
      await user.save();

      res.json({ message: "Repository successfully cloned into Docker volume." });
    }
  } catch (err) {
    console.error("Clone error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/protected/get-shared-users/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const userList = await clerkClient.users.getUserList()

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '
  const payload = jwtDecode(token);

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const repo = user.repos.id(id);
  if (!repo) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  //Get userInfo from clerk
  const users = repo.sharedUsers;
  let sharedUsers = [];

  for (const user of users) {
    const foundUser = userList.data.find(u => u.id === user.userId);
    if (foundUser) sharedUsers.push(
      { raw: foundUser._raw, role: user.role });
  }
  console.log(sharedUsers)

  res.json({ sharedUsers, access: repo.access, action: repo.action, vmId: repo.vmId });
})

app.get('/:vmId/shared-users', async (req, res) => {
  const { vmId } = req.params;
  console.log("vmId", vmId)
  const userList = await clerkClient.users.getUserList();

  try {
    const userDoc = await User.findOne(
      { 'repos.vmId': vmId },
      { 'repos.$': 1 }            // MongoDB positional projection
    ).lean();

    if (!userDoc || !userDoc.repos || userDoc.repos.length === 0) {
      return res.status(404).json({ message: 'VM not found' });
    }
    const sharedUsers = userDoc.repos[0].sharedUsers;
    let users = []
    console.log(sharedUsers);
    for (const sharedUser of sharedUsers) {
      const user = userList.data.find(user => user.id === sharedUser.userId);
      console.log(user);
      users.push({ name: user.firstName + " " + user.lastName, role: sharedUser.role, img: user.imageUrl });
    }
    return res.json({ users });
  } catch (err) {
    console.error('Error fetching sharedUsers:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


app.get('/search', async (req, res) => {
  const { term, container } = req.query;

  if (!term || !container) {
    return res.status(400).json({ error: 'Search term and container name/id are required' });
  }

  // Construct the docker exec command
  // docker exec e94ab2… bash -lc "grep -riI --color=never 'app' /app 2>/dev/null"

  // const cmd = `docker exec ${container} bash -lc grep -riI --color=never '${term}' 2>/dev/null`;
  const cmd = `docker exec ${container} bash -lc "grep -riI --color=never '${term}' /app 2>/dev/null"`;


  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }

    const lines = stdout.trim().split('\n').filter(Boolean).map(line => {
      const [filePath, ...rest] = line.split(':');
      return {
        file: filePath,
        match: rest.join(':').trim(),
      };
    });

    res.json({ matches: lines });
  });
});



const getSharedReposForUser = async (targetUserId) => {
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

    // Flatten the shared repos
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


app.get('/protected/get-shared-repos', async (req, res) => {
  // const { id } = req.params;
  const authHeader = req.headers.authorization;
  const userList = await clerkClient.users.getUserList()

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '
  const payload = jwtDecode(token);

  // const user = await User.findOne({ userId: payload.sub });
  // if (!user) {
  //   return res.status(404).json({ error: 'User not found' });
  // }

  // const repo = user.repos.id(id);
  // if (!repo) {
  //   return res.status(404).json({ error: 'Repository not found' });
  // }
  const repos = await getSharedReposForUser(payload.sub);
  if (!repos) {
    return res.status(404).json({ error: 'No shared repos found' });
  }

  //Get userInfo from clerk
  console.log(repos.filter(repo => repo.owner !== payload.sub))

  res.json(repos.filter(repo => repo.owner !== payload.sub));
})

const getSharedUserIdsByVmId = async (vmId) => {
  try {
    const users = await User.find({
      "repos.vmId": vmId
    }, {
      "repos.$": 1  // Use positional operator to return only the matching repo
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


app.get('/protected/check-repo/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  const userList = await clerkClient.users.getUserList()

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token found' });
  }

  const token = authHeader.split(' ')[1]; // remove 'Bearer '
  const payload = jwtDecode(token);

  const user = await User.findOne({ userId: payload.sub });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const users = await getSharedUserIdsByVmId(id);
  if (users.find(user => user === payload.sub)) {
    return res.status(200).json({ message: 'User has access' });
  }

  return res.status(403).json({ message: 'User does not have access' });

})





// Create the HTTP server **once** and attach Socket.IO to it
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  }
});

// const backend = new ShareDB();
const rooms = {};
// const users = [];
let userList = [];
setInterval(async () => {
  userList = await clerkClient.users.getUserList();
}, 10000);


io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);
  // Ask client to send token+container info
  socket.emit('sendToken', 'Send token');

  socket.on('sendToken', async ({ token, containerId }) => {
    console.log('Received containerId:', containerId);

    // Decode JWT
    let payload;
    try {
      payload = jwtDecode(token);
    } catch (err) {
      console.error('Invalid token:', err);
      socket.emit('output', 'Error: Invalid token.');
      return;
    }

    // Verify user exists
    let user;
    try {
      user = await User.findOne({ userId: payload.sub });
    } catch (err) {
      console.error('Database lookup error:', err);
      socket.emit('output', 'Error: Database error.');
      return;
    }
    if (!user) {
      console.error('User not found in DB:', payload.sub);
      socket.emit('output', 'Error: User not found.');
      return;
    }
    console.log('Decoded Token Payload (sub):', payload.sub);

    // Get or create Docker container
    let container = docker.getContainer(containerId);
    let containerIdOrName = containerId;
    try {
      const info = await container.inspect();
      if (!info.State.Running) {
        await container.start();
        console.log('Started existing container:', containerIdOrName);
      }
    } catch (err) {
      console.log('Container not found or not running, creating a new one');
      try {
        container = await docker.createContainer({
          Image: 'ubuntu',
          name: randomBytes(4).toString('hex'),
          Tty: true,
          Cmd: ['/bin/bash'],
        });
        await container.start();
        containerIdOrName = container.id;
        console.log('✅ New container started:', containerIdOrName);
      } catch (createErr) {
        console.error('❌ Failed to create or start container:', createErr);
        socket.emit('output', 'Error: Failed to create or start new container.');
        return;
      }
    }

    // Spawn a pty bash session inside the container
    const ptyProcess = pty.spawn('docker', ['exec', '-it', containerIdOrName, '/bin/bash'], {
      name: 'xterm-color',
      cols: 80,
      rows: 12,
      cwd: process.env.HOME,
      env: process.env,
    });

    console.log('🔥 PTY session started for container:', containerIdOrName);

    // (Optional) run your install script immediately
    const installScript = `
export DEBIAN_FRONTEND=noninteractive && \
apt-get update && \
apt-get install -y \
  gcc make build-essential git curl wget unzip zsh tmux nano neofetch tzdata vim locales && \
ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
dpkg-reconfigure --frontend noninteractive tzdata && \
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  tee /etc/apt/sources.list.d/ngrok.list && \
apt update && apt install -y ngrok && \
ngrok config add-authtoken YOUR_NGROK_TOKEN && \
echo "✅ Installed development tools and configured tzdata"
`;
    ptyProcess.write(`${installScript}\n`);

    //Send signal for files ready


    // socket.emit('filesReady', 'files are ready to be read');

    // socket.on('getFiles', (data) => {
    //   // console.log('getFiles event received:', data);
    //   const cmd = `docker exec ${data.id} ls -laR ${data.path}`;

    //   exec(cmd, (error, stdout, stderr) => {
    //     if (error) {
    //       return socket.emit('files', { error: stderr });
    //     }
    //     const files = stdout.split('\n').slice(1).map(line => line.trim()).filter(Boolean);
    //     socket.emit('files', { files });
    //   });
    // });

    // Relay container output back to client
    ptyProcess.on('data', (data) => {
      // console.log('Data received from container:', data);
      socket.emit('output', { data });
    });

    // Relay client input into the container
    socket.on('input', (data) => {
      console.log('Input received:', data);
      ptyProcess.write(data);
    });


    // Cleanup on disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      ptyProcess.kill();
      io.sockets.adapter.rooms.get(containerIdOrName)?.delete(socket.id);
      if (io.sockets.adapter.rooms.get(containerIdOrName)?.size === 0) {
        console.log("No more clients in the room, stopping container");
        try {
          await container.stop();
          console.log(`Container ${containerIdOrName} stopped.`);
        } catch (stopErr) {
          console.error(`Failed to stop container ${containerIdOrName}:`, stopErr);
        }
      }
    });
  });

  socket.emit('filesReady', 'files are ready to be read');

  console.log(`Client connected: ${socket.id}`);

  // Relay drawing data to all other clients
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });
  socket.on('undo', (data) => {
    socket.broadcast.emit('drawing', data);
  });

  socket.on('getFiles', (data) => {
    // console.log('getFiles event received:', data);
    const cmd = `docker exec ${data.id} ls -laR ${data.path}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('files', { error: stderr });
      }
      const files = stdout.split('\n').slice(1).map(line => line.trim()).filter(Boolean);
      socket.emit('files', { files });
    });
  });

  socket.on('openFile', (data) => {
    console.log('openFile event received:', data);
    const cmd = `docker exec ${data.id} cat ${data.path}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('fileContent', { error: stderr });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });

  socket.on('deleteFile', (data) => {
    console.log('deleteFile event received:', data);
    const cmd = `docker exec ${data.id} rm -rf ${data.path}`;
    socket.emit("filesReady", 'files are ready to be read');

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('fileContent', { error: stderr });
      }
      socket.emit('fileContent', { content: stdout, path: data.path });
    });
  });


  socket.on('renameFile', ({ id, path: oldPath, newName }) => {
    // force POSIX semantics:
    const dir = path.posix.dirname(oldPath);
    const newPath = path.posix.join(dir, newName);

    const cmd = `docker exec ${id} mv "${oldPath}" "${newPath}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return socket.emit('renameError', { error: stderr });
      socket.emit("filesReady", 'files are ready to be read');
      // socket.emit('fileContent', { content: stdout, oldPath, newPath });

      // socket.emit('renameSuccess', { oldPath, newPath });
    });
  });

  socket.on('save-file', ({ roomId, path: rawPath, code }) => {
    console.log('save-file event:', { roomId, rawPath });

    // Force POSIX-style path
    const filePath = rawPath.replace(/\\/g, '/');

    // Spawn `docker exec -i <roomId> tee <filePath>`
    const proc = spawn('docker', ['exec', '-i', roomId, 'tee', filePath]);

    // Pipe the code into the container's file
    proc.stdin.write(code);
    proc.stdin.end();

    proc.on('error', (err) => {
      console.error('spawn error:', err);
      socket.emit('saveError', { error: err.message });
    });

    proc.on('close', (exitCode) => {
      if (exitCode === 0) {
        console.log(`Saved ${filePath} in container ${roomId}`);
        socket.emit('saveSuccess', { path: filePath });
      } else {
        const errMsg = `tee exited with code ${exitCode}`;
        console.error(errMsg);
        socket.emit('saveError', { error: errMsg });
      }
    });
  });




  socket.on('join-room', async ({ token, roomId }) => {
    try {
      const payload = jwtDecode(token);
      // const session = await clerkClient.sessions.verifySessionToken(token);
      const userId = payload.sub;
      socket.data.userId = userId;
      socket.join(roomId);
      console.log(`👤 ${userId} joined room ${roomId}`);

      // Initialize room store
      if (!rooms[roomId]) rooms[roomId] = {};
      console.log('Users in room', roomId, io.sockets.adapter.rooms.get(roomId).size);

      // Notify others
      socket.to(roomId).emit('user-joined', { username: userId });
    } catch (err) {
      console.error('🔒 auth failed', err);
      socket.emit('error', { message: 'authentication_failed' });
    }
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });


  socket.on('code-change', async ({ roomId, path, code, token }) => {
    // console.log("code-change", roomId, path)
    if (userList.length === 0) return;
    const payload = jwtDecode(token);
    const userId = payload.sub;
    // console.log("user", userList)
    const user = userList?.data?.find(user => user?.id === userId)
    // console.log("userList: ", user.firstName)
    const userName = user.firstName + " " + user.lastName
    // console.log("user: ", userName)
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][path] = code;
    socket.to(roomId).emit('code-change', { path, code, userId: userId });
  });


  socket.on('cursor-change', async ({ roomId, path, position, token }) => {
    console.log("cursor-change", position, roomId)
    if (!token) {
      socket.to(roomId).emit('cursor-change', { path, position, username: roomId });
      return
    }
    console.log(token)
    // const username = socket.data.userId;
    const payload = jwtDecode(token);
    const userId = payload.sub;
    const userList = await clerkClient.users.getUserList()
    // console.log("user", us?erList)
    const user = userList?.data?.find(user => user?.id === userId)
    // console.log("userList: ", user.firstName)
    const userName = user.firstName + " " + user.lastName
    console.log("user: ", userName)
    socket.to(roomId).emit('cursor-change', { path, position, username: userName });
  });

});

server.listen(4000, () => {
  console.log('🚀 Server is running on port 5000');
});

