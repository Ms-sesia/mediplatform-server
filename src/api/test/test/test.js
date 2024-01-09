import { PrismaClient } from "@prisma/client";
import { genDidUnique } from "../../../generate";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        const didUniqueId = genDidUnique(term);
        console.log("didUniqueId:", didUniqueId);

        return true;
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};
