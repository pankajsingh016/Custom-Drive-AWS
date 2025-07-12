import express from "express";
import { FileController } from "../controllers/fileController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";

export const fileRouter = express.Router();
fileRouter.post("/upload", verifyToken, upload.single("file"), FileController.upload);
fileRouter.get("/", verifyToken, FileController.list);
fileRouter.delete("/:id", verifyToken, FileController.remove);
