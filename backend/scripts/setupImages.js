import docker from '../config/docker.js';
import { executionImages } from '../config/executionImages.js';
import path from 'path';
import fs from 'fs';

async function setupImages() {
  console.log('🚀 Starting Docker Execution Environment Setup...\n');

  for (const img of executionImages) {
    if (img.type === 'build') {
      await buildImage(img);
    } else if (img.type === 'pull') {
      await pullImage(img);
    }
  }

  console.log('\n✅ All execution images are ready!');
}

async function buildImage(img) {
  console.log(`🔨 Building image: ${img.name} from ${img.dockerfile}...`);
  
  const dockerfilePath = path.resolve(img.dockerfile);
  if (!fs.existsSync(dockerfilePath)) {
    console.error(`❌ Error: Dockerfile not found at ${dockerfilePath}`);
    return;
  }

  try {
    // We send the necessary files to Docker as a tar stream
    // For these simple Dockerfiles, we just need the Dockerfile itself 
    // since we don't have COPY commands referencing other files yet.
    const stream = await docker.buildImage({
      context: path.resolve(img.context),
      src: [img.dockerfile] 
    }, {
      t: img.name,
      dockerfile: img.dockerfile
    });

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }, (event) => {
        if (event.stream) {
          process.stdout.write(event.stream);
        }
      });
    });
    console.log(`\n✨ Successfully built ${img.name}\n`);
  } catch (err) {
    console.error(`\n❌ Failed to build ${img.name}: ${err.message}\n`);
    throw err; // Ensure error propagates
  }
}

async function pullImage(img) {
  console.log(`📥 Pulling image: ${img.name}...`);
  try {
    const stream = await docker.pull(img.name);
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }, (event) => {
        if (event.status) {
          process.stdout.write(`\r[${img.name}] ${event.status} ${event.progress || ''}`);
        }
      });
    });
    console.log(`\n✨ Successfully pulled ${img.name}\n`);
  } catch (err) {
    console.error(`\n❌ Failed to pull ${img.name}: ${err.message}\n`);
    throw err; // Ensure error propagates
  }
}

// Ensure the script properly waits for completion and handles fatal errors
try {
  await setupImages();
  process.exit(0);
} catch (err) {
  console.error('\n💥 Fatal error during setup:', err.message);
  process.exit(1);
}
