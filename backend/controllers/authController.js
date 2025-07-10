const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


async function register(req, res) {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const id = await User.createUser(email, hashedPassword);
    res.json({ id, email });
  } catch (err) {
    res.status(500).json({ error: "User exists or DB erro" });
  }
}


async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(400).json({ error: "Invalid Credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expireIn: "1h",
  });
  res.json({ token });
}

module.exports = {register, login};