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
// // app.use(cors())
// app.use(express.json())

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//   },
// });

// app.use(cors({
//   origin: 'http://localhost:5173',  // Allow requests from your frontend
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));


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
    { ubuntu: 'ubuntu' },
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

    const repo = user.repos.id(id);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
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





// Create the HTTP server **once** and attach Socket.IO to it
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  }
});


io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers["authorization"];

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }
  console.log(header) 
  const token = header.substring(7);
  console.log(token)
  // jwt.verify(token, jwtSecret, (err, decoded) => {
  //   if (err) {
  //     return next(new Error("invalid token"));
  //   }
  //   req.user = decoded.data;
    next();
  // });
});



io.on('connection', async (socket) => {
  console.log('🟢 Client connected:', socket.id);
  //get userId from socket
  const token = socket.handshake.auth; // Get the token from the socket handshake
  // console.log('Token:', token);
  if (!token) {
    return socket.emit('output', 'Unauthorized - No token found');
  }
  // console.log('Token:', token);
  // const payload = jwtDecode(token);
  // const userId = payload.sub;
  // console.log('User ID:', userId);


  console.log('Socket ID:', socket.id);

  let containerIdOrName = '4ef1ca55fc6a8101220ee549d5f57af2532a66fe38904e049d2d753a850299da'; // 🔁 your container name or ID here

  let container = docker.getContainer(containerIdOrName);
  // console.log(container)


  try {
    const containerInfo = await container.inspect();
    if (!containerInfo.State.Running) {
      await container.start();
    }
  } catch (err) {
    try {
      const newContainer = await docker.createContainer({
        Image: 'ubuntu',
        name: randomBytes(8).toString('hex'),
        Tty: true,
        Cmd: ['/bin/bash'],
      });
      await newContainer.start();
      container = newContainer;
      console.log('New container started:', container.id);
      containerIdOrName = container.id;
    } catch (err) {
      console.error('Failed to create or start new container:', err);
      socket.emit('output', 'Error: Failed to create or start new container.');
      // return;

      socket.emit('output', 'Error: Container not found.');
      // return;
    }
    socket.emit('output', 'Error: Container not found or failed to start.');
    // return;
  }

  // Attach to existing container
  // console.log("container Id",containerIdOrName)
  const ptyProcess = pty.spawn('docker', ['exec', '-it', containerIdOrName, '/bin/bash'], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  const installScript = `
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y tzdata python3 gcc && \
  ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
  dpkg-reconfigure -f noninteractive tzdata && \
  echo "✅ Installed python3, gcc, and configured tzdata"
  `;

  ptyProcess.write(`${installScript}\n`);

  // Wait for the installation to complete before piping output
  ptyProcess.on('data', (data) => {
    socket.emit('output', data);
  });

  // Pipe client input to container
  socket.on('input', (data) => {
    ptyProcess.write(data);
  });
  socket.on('getFiles', (data) => {
    const cmd = `docker exec ${containerIdOrName} ls -la ${data.path}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return socket.emit('files', { error: stderr });
      }
      // parse output if needed
      const files = stdout.split('\n').slice(1).map(line => line.trim()).filter(Boolean);
      socket.emit('files', { files });
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);

    // Send exit command to gracefully terminate the terminal session
    ptyProcess.kill();

    // Stop the Docker container when the client disconnects
    if (container) {
      try {

        container.stop().then(() => {
          console.log(`Container ${containerIdOrName} stopped.`);
        }).catch((err) => {
          console.log(`Failed to stop container ${containerIdOrName}:`, err);
        });
      } catch (error) {
        console.log(error)
      }
    }
    container.stop();
    console.log(`👍Container ${containerIdOrName} stopped.`);
  });
});

// **Only one** listen call—handles both HTTP and WebSocket on port 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});





// app.post("/authenticate", async (req, res) => {
//   const code = req.body.code;
//   try {
//     const response = await axios.post(
//       "https://github.com/login/oauth/access_token",
//       {
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//         code,
//       },
//       {
//         headers: { Accept: "application/json" },
//       }
//     );

//     const accessToken = response.data.access_token;
//     res.json({ access_token: accessToken });
//   } catch (error) {
//     console.error("Error authenticating with GitHub:", error.message);
//     res.status(500).json({ error: "Failed to authenticate" });
//   }
// });

// // Endpoint to handle code execution
// // app.post('/run-code', (req, res) => {
// //   const { language, code } = req.body;

// //   // Basic validation and sanitation
// //   if (!language || !code) {
// //     return res.status(400).json({ error: 'Language and code are required' });
// //   }

// //   // Depending on language, prepare the docker command.
// //   // Example: running Python code in a Python Docker image.
// //   let dockerImage;
// //   let command;

// //   switch (language) {
// //     case 'python':
// //       // dockerImage = 'python:3.9-alpine'; // lightweight Alpine image
// //       dockerImage = 'python-3.14-slim'; // lightweight Alpine image
// //       // Create a shell command to execute code. We echo code into a file and then run it.
// //       command = `docker run --rm ${dockerImage} sh -c "echo '${code.replace(/"/g, '\\"')}' > script.py && python script.py"`;
// //       break;
// //     // Add other languages (node, ruby, etc.) as needed
// //     default:
// //       return res.status(400).json({ error: 'Unsupported language' });
// //   }

// //   exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
// //     if (error) {
// //       console.error('Execution error:', error);
// //       return res.status(500).json({ error: stderr || error.message });
// //     }
// //     return res.json({ output: stdout, error: stderr });
// //   });
// // });

// app.get("/download/:user/:repo", async (req, res) => {
//   const { user, repo } = req.params;
//   const token = req.headers.authorization;
//   console.log(user, repo)
//   try {
//     const githubResponse = await axios.get(
//       `https://api.github.com/repos/${user}/${repo}/zipball/main`,
//       {
//         headers: {
//           Authorization: token,
//           Accept: "application/vnd.github+json",
//           "X-GitHub-Api-Version": "2022-11-28",
//         },
//         responseType: "stream",
//       }
//     );

//     res.setHeader("Content-Disposition", `attachment; filename=${repo}.zip`);
//     githubResponse.data.pipe(res);
//   } catch (error) {
//     console.error("Error downloading repository zip:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// server.js
