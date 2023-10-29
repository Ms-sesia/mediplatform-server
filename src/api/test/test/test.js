import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { time } = args;
      try {
        const today = new Date();
        // const dateForNum = today.toISOString().split("T").replace("-", "");
        const dateForNum = today.toISOString().split("T")[0].replaceAll("-", "");
        console.log(dateForNum);

        return true;
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};
