import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    pwInit: async (_, args, { request, isAuthenticated }) => {
      const { term } = args;
      try {
        const hashedInfo = await hashPassword("12341234");

        return {
          salt: hashedInfo.salt,
          password: hashedInfo.password,
        };
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};
