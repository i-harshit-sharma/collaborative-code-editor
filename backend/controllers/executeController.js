import docker from '../config/docker.js';
import { PassThrough } from 'stream';

export const executeCode = async (req, res) => {
  const { language, sourceCode } = req.body;
  const encodedCode = Buffer.from(sourceCode).toString('base64');

  const specs = {
    python: {
      image: 'python:3.9-slim',
      cmd: ['python3', '-c', sourceCode],
      timeout: 30000,
      memory: 128 * 1024 * 1024
    },
    javascript: {
      image: 'code-collab-node-executor',
      cmd: ['node', '-e', sourceCode],
      timeout: 30000,
      memory: 128 * 1024 * 1024
    },
    typescript: {
      image: 'code-collab-node-executor',
      cmd: ['bash', '-c', `echo "${encodedCode}" | base64 -d > main.ts && tsx main.ts`],
      timeout: 30000,
      memory: 256 * 1024 * 1024
    },
    cpp: {
      image: 'gcc:latest',
      cmd: ['bash', '-c', `echo "${encodedCode}" | base64 -d > main.cpp && g++ main.cpp -o main && ./main`],
      timeout: 30000,
      memory: 256 * 1024 * 1024
    },
    java: {
      image: 'eclipse-temurin:17-jdk',
      cmd: ['bash', '-c', `echo "${encodedCode}" | base64 -d > HelloWorld.java && javac HelloWorld.java && java HelloWorld`],
      timeout: 30000,
      memory: 512 * 1024 * 1024
    }
  };

  const spec = specs[language];
  if (!spec) return res.status(400).json({ error: 'Unsupported language' });

  let container;
  try {
    container = await docker.createContainer({
      Image: spec.image,
      Cmd: spec.cmd,
      Tty: false,
      HostConfig: {
        AutoRemove: true,
        Memory: spec.memory || 128 * 1024 * 1024,
        NanoCpus: 500000000,
      },
    });

    await container.start();

    const logStream = await container.logs({
      stdout: true,
      stderr: true,
      follow: true,
    });

    let stdout = '';
    let stderr = '';

    const stdoutStream = new PassThrough();
    const stderrStream = new PassThrough();

    stdoutStream.on('data', (chunk) => stdout += chunk.toString('utf8'));
    stderrStream.on('data', (chunk) => stderr += chunk.toString('utf8'));

    container.modem.demuxStream(logStream, stdoutStream, stderrStream);

    const timeoutMs = spec.timeout || 5000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timed out')), timeoutMs);
    });

    await Promise.race([
      container.wait(),
      timeoutPromise
    ]);

    res.json({
      run: {
        stdout: stdout,
        stderr: stderr,
        output: stdout + stderr,
      }
    });

  } catch (error) {
    console.error('Execution error:', error.message);

    if (error.message === 'Execution timed out' && container) {
      try {
        await container.kill();
      } catch (killError) {
        if (killError.statusCode !== 404) {
          console.error("Failed to kill container:", killError.message);
        }
      }
    }

    res.status(500).json({
      run: {
        stdout: '',
        stderr: error.message,
        output: error.message
      }
    });
  }
};
