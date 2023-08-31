import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  user: {
    user_permission: async (parent) =>
      await prisma.user.findUnique({ where: { user_id: parent.user_id } }).userPermission(),
  },
};
