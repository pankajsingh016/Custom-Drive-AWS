import { prisma } from "../config/prismaClient.js";

export const FileRepository = {
  create: (filename, s3Key, userId) =>
    prisma.file.create({ data: { filename, s3Key, userId } }),

  findAllByUser: (userId) =>
    prisma.file.findMany({ where: { userId } }),

  findById: (id) =>
    prisma.file.findUnique({ where: { id } }),

  deleteById: (id) =>
    prisma.file.delete({ where: { id } })
};
