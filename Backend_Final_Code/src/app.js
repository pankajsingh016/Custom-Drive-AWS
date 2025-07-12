import express from "express";
import dotenv from "dotenv";
import {authRouter} from "./routes/authRoutes.js";
import {fileRouter} from "./routes/fileRoutes.js";


dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/auth",authRouter);
app.use("/api/file",fileRouter);

// app.js -> routes -> controllers -> services -> respositories(will write the code in db)
// app.js -> routes(middlewares if needed for protected routes) -> controllers -> services -> repositoreis(will do the operation on db)
// modular code and make objects of each functionality


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{console.log(`SERVER is up and running in localhost:${PORT}`)});