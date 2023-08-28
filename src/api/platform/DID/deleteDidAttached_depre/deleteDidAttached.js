import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDidAttached: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { fileName } = args;
      const storagePath = path.join(__dirname, "../../../../../", "didMedia");
      try {
        if (user.userType !== "user") throw 1;

        if (fileName) {
          if (fs.existsSync(`${storagePath}/${fileName}`)) {
            console.log("존재");
            // fs.unlinkSync(`${storagePath}/${fileName}`);
          }
        }

        return true;
      } catch (e) {
        console.log("did 첨부파일 삭제(취소) 실패. deleteDidAttached ==>\n", e);
        throw new Error("did 첨부파일 삭제(취소) 실패하였습니다.");
      }
    },
  },
};
