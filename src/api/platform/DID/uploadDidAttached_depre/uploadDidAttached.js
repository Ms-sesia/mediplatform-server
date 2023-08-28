import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default {
  Mutation: {
    uploadDidAttached: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { files } = args;
      const storagePath = path.join(__dirname, "../../../../../", "didMedia");
      try {
        if (!files.length) throw 2;

        let fileUrl = [];
        for (let i = 0; i < files.length; i++) {
          const { createReadStream, filename, encoding, mimetype } = await files[i];
          const stream = createReadStream();

          const fileRename = `${Date.now()}-${filename}`;

          await stream.pipe(fs.createWriteStream(`${storagePath}/${fileRename}`));

          fileUrl.push();
        }

        return fileRename;
      } catch (e) {
        if (e === 2) throw new Error("파일을 업로드해주세요.");
        console.log("did 첨부파일 업로드 실패. uploadDidAttached ==>\n", e);
        throw new Error("did 첨부파일 업로드에 실패하였습니다.");
      }
    },
  },
};
