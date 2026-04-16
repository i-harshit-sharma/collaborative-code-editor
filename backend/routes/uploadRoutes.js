import express from 'express';
import multer from 'multer';
import { uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ dest: "uploads/" });

export default (io) => {
  router.post("/upload", upload.array("files"), (req, res) => uploadFiles(req, res, io));
  return router;
};
