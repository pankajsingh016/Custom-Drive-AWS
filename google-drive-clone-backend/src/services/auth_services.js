const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { hashPassword, comparePasswords } = require('../utils/hash');

exports.register = async (email, password) => {
  const hashed = await hashPassword(password);
  return await prisma.user.create({
    data: { email, password: hashed },
  });
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePasswords(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token };
};
