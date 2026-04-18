import docker, { getBackendNetwork } from '../config/docker.js';

export const createContainerFromImages = async (imageList, language) => {
  const networkName = await getBackendNetwork();
  
  for (const imageObj of imageList) {
    const imageName = imageObj[language];
    if (!imageName) continue;

    try {
      const containerConfig = {
        Image: imageName,
        Cmd: ['bash'],
        Tty: true,
        ExposedPorts: {
          '80/tcp': {},
          '3000/tcp': {},
          '4173/tcp': {},
          '5000/tcp': {},
          '5173/tcp': {},
          '8000/tcp': {},
          '8080/tcp': {},
        },
        HostConfig: {
          PublishAllPorts: true,
        },
      };

      if (networkName) {
        console.log(`🔗 Joining same network as backend: ${networkName}`);
        containerConfig.HostConfig.NetworkMode = networkName;
      }

      const container = await docker.createContainer(containerConfig);

      await container.start();
      console.log(`Container created and started from image "${imageName}"`);
      return container.id;
    } catch (err) {
      console.warn(`Failed with image "${imageName}": ${err.message}`);
    }
  }

  throw new Error('None of the images could be used to create a container.');
};
