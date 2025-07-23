const bcrypt = require('bcryptjs');

exports.hashPassword = async (plain) => await bcrypt.hash(plain, 10);

exports.comparePasswords = async (plain, hashed) => await bcrypt.compare(plain, hashed);
