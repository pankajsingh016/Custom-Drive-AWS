import { prisma } from "../config/prismaClient.js";

// put meta data in db, like create, find, findUnique, delete
const FileRepository = {
  create: (filename, s3Key, userId) => {
    prisma.file.create({ data: { filename, s3Key, userId } });
  },
  findAllByUser: (userId) => {
    prisma.file.findMany({ where: { userId } });
  },
  findById: (id) => {
    prisma.file.findUnique({ where: { id } });
  },
  deleteById: (id) => {
    prisma.file.delete({ where: { id } });
  },
};

export { FileRepository };
