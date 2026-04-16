import docker from '../config/docker.js';

export const createContainerFromImages = async (imageList, language) => {
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
};
