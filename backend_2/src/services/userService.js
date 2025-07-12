import { UserRepository } from "../repositories/userRepository.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export const UserService = {
  async register(email, plainPassword) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new Error("User already exists");
    const hashed = await hashPassword(plainPassword);
    return UserRepository.create(email, hashed);
  },

  async login(email, plainPassword) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await comparePassword(plainPassword, user.password);
    if (!valid) throw new Error("Invalid credentials");

    return generateToken({ id: user.id });
  }
};
