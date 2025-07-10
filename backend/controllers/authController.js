import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {createUser, findByEmail} from "../models/userModel.js"

async function register(req, res) {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const id = await createUser(email, hashedPassword);
    res.json({ id, email });
  } catch (err) {
    res.status(500).json({ error: "User exists or DB erro" });
  }
}


async function login(req, res) {
  const { email, password } = req.body;
  const user = await findByEmail(email);
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

export {register, login};