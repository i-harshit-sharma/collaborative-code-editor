import path from 'path';
import fs from 'fs-extra';
import { exec } from 'child_process';

export const uploadFiles = async (req, res, io) => {
  const files = req.files;
  const containerId = req.body.containerId;
  const targetPath = "/app";

  try {
    for (const file of files) {
      const destPath = path.join("temp_upload", file.originalname);
      await fs.move(file.path, destPath, { overwrite: true });

      console.log("Updating container with file:", `docker cp ${destPath} ${containerId}:${targetPath}`);
      exec(`docker cp ${destPath} ${containerId}:${targetPath}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error copying file to Docker: ${stderr}`);
        }
      });
      if (io) io.emit('filesReady', 'files are ready to be read');
    }

    res.status(200).send("Files transferred to container");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to upload files");
  }
};
