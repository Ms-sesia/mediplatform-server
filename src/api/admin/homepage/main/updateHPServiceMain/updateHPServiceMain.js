import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHPServiceMain: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsm_id, mainImg } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        let hpServiceMain;
        if (hsm_id > 0) hpServiceMain = await prisma.homepageServiceMain.findUnique({ where: { hsm_id } });

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

          if (hpServiceMain) {
            // 있으면 수정
            await prisma.homepageServiceMain.update({
              where: { hsm_id },
              data: {
                hsm_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hsm_adminName: loginAdmin.admin_name,
                hsm_adminRank: loginAdmin.admin_rank,
                hsm_adminId: loginAdmin.admin_id,
              },
            });
          } else {
            // 없으면 생성
            await prisma.homepageServiceMain.create({
              data: {
                hsm_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hsm_adminName: loginAdmin.admin_name,
                hsm_adminRank: loginAdmin.admin_rank,
                hsm_adminId: loginAdmin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 메인이미지 수정(등록) 실패. updateHPServiceMain", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
