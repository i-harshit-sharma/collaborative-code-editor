import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';
import logger from '../utils/logger.js';

export const uploadFiles = async (req, res, io) => {
  const files = req.files;
  const containerId = req.body.containerId;
  const targetPath = "/app";

  try {
    for (const file of files) {
      const destPath = path.join("temp_upload", file.originalname);
      await fs.move(file.path, destPath, { overwrite: true });

      logger.info(`📤 Updating container ${containerId} with file: ${file.originalname}`);
      exec(`docker cp ${destPath} ${containerId}:${targetPath}`, (err, stdout, stderr) => {
        if (err) {
          logger.error(`Error copying file to Docker: ${stderr || err.message}`);
        }
      });
      if (io) io.emit('filesReady', 'files are ready to be read');
    }

    res.status(200).send("Files transferred to container");
  } catch (error) {
    logger.error(`Failed to upload files: ${error.message}`);
    res.status(500).send("Failed to upload files");
  }
};
