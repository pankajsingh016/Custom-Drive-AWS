import { prisma } from "../config/prismaClient.js";

export const UserRepository = {
  create: (email, password) =>
    prisma.user.create({ data: { email, password } }),

  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } })
};
