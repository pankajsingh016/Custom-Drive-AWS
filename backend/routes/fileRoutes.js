import express from "express";

import {
  uploadFile,
  listFiles,
  deleteFile,
} from "../controllers/fileController.js";
import upload from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), uploadFile);
router.get("/files", verifyToken, listFiles);
router.delete("/files/:id", verifyToken, deleteFile);

export default router;
