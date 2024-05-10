import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHPMain: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hm_id, mainImg } = args;
      console.log("updateHPMain args:", args);
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");

        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        let hpMain;
        if (hm_id > 0) hpMain = await prisma.homepageMain.findUnique({ where: { hm_id } });

        if (mainImg) {
          const { createReadStream, filename, encoding, mimetype } = await mainImg;
          const stream = createReadStream();

          const fileRename = `${Date.now()}-${filename}`;

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

          if (hpMain) {
            // 있으면 수정
            await prisma.homepageMain.update({
              where: { hm_id },
              data: {
                hm_createdAt: new Date(),
                hm_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hm_adminName: loginAdmin.admin_name,
                hm_adminRank: loginAdmin.admin_rank,
                hm_adminId: loginAdmin.admin_id,
              },
            });
          } else {
            // 없으면 생성
            await prisma.homepageMain.create({
              data: {
                hm_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hm_adminName: loginAdmin.admin_name,
                hm_adminRank: loginAdmin.admin_rank,
                hm_adminId: loginAdmin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 메인이미지 수정(등록) 실패. updateHPMain", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
