import bcrypt from "bcrypt";

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}
