import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../libs/passwordHashing";
import getInfobankToken from "../../expApi/router/Infobank/getInfobankToken";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      const { term } = args;
      try {
        const getIBToken = await getInfobankToken();
        console.log("getIBToken:", getIBToken);
        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};
