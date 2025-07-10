require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/authRoutes');
const fileRouter = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/mydrive',authRouter);
app.use('/mydrive',fileRouter);

// app.get('/',(req,res)=>{res.send('backend is up and runnning')});

const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})