import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import fileRouter from "./routes/fileRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/mydrive", authRouter);
app.use("/mydrive", fileRouter);

// app.get('/',(req,res)=>{res.send('backend is up and runnning')});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
