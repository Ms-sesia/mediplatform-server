import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { time } = args;
      try {
        console.log("입력 값:", time);
        console.log("입력 값:", typeof time);
        console.log("Date객체:", new Date(time));
        console.log("toISOStrig:", new Date(time).toISOString());

        return true;
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};
