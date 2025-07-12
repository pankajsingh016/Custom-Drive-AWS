import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRoutes.js";
import { fileRouter } from "./routes/fileRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server at http://localhost:${PORT}`));
