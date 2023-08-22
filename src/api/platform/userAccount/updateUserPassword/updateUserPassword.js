import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUserPassword: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      const { email, password } = args;
      try {
        

        

        return true;
      } catch (e) {
        console.log("사용자 추가 실패. createUser", e);
      }
    },
  },
};
