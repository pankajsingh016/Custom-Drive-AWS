// Converted: my-fullstack-app/backend/src/utils/hash.js

// Import bcryptjs using require
const bcrypt = require('bcryptjs');

// Define your functions
async function hashPassword(plain) {
  return await bcrypt.hash(plain, 10);
}

async function comparePasswords(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}

// Export the functions using module.exports
module.exports = {
  hashPassword,
  comparePasswords
};