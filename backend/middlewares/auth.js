require('dotenv').config();
const jwt = require("jsonwebtoken");

exports.verifyToken = (req,res,next)=>{
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({'error':'Token Missing'});

    jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
        if(err) return res.status(401).json({'error':'Invalid Token'});
        req.user = decoded;
        next();
    });
};