const cors = require("cors");
const cookieParser = require('cookie-parser');
const express = require('express');
require('dotenv').config();
const app = express();

const authRoutes = require('./routes/auth_routes');
const fileRoutes = require('./routes/file_routes');

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use(cookieParser());

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

// api routes
//**
/* 
/api/auth/register _ take username and email,password from body and register it to the user
/api/auth/login/ -> return the login details object data.token object nested
/api/files/ _ get all the files listed in the app
/api/files/upload _. verify token and upload the file
*/