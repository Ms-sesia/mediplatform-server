import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUserImg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_img } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../", "images");

        // 이미지 업로드
        if (user_img) {
          const userImgName = loginUser.user_img.split("/")[3];
          if (loginUser.user_img) {
            if (fs.existsSync(`${storagePath}/${userImgName}`)) {
              fs.unlinkSync(`${storagePath}/${userImgName}`);
            }
          }
          const { createReadStream, filename, encoding, mimetype } = await user_img;
          const stream = createReadStream();
          const fileRename = `${Date.now()}-${filename}`;
          // await stream.pipe(fs.createWriteStream(`${storagePath}/${fileRename}`));
          const writeStream = fs.createWriteStream(`${storagePath}/${fileRename}`);
          stream.pipe(writeStream);

          const fileWritePromise = new Promise((resolve, reject) => {
            writeStream.on("finish", () => {
              const stats = fs.statSync(`${storagePath}/${fileRename}`);
              resolve(stats);
            });
            writeStream.on("error", reject);
          });

          const stats = await fileWritePromise;

          const userImgUrl = `${process.env.LOCALSTORAGEADDR}${fileRename}`;

          await prisma.user.update({
            where: { user_id: user.user_id },
            data: { user_img: userImgUrl },
          });
        } else throw 1;

        return true;
      } catch (e) {
        console.log("프로필 이미지 등록 실패. updateUserImg", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
