import jwt from "jsonwebtoken";

export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expire: "1h" });
}

export function verifyTokenHeader(req, res, next) {
  const headers = req.headers.authorization;
  if (!headers) return res.status(401).json({ message: "No Token Present" });

  const token = headers.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}
