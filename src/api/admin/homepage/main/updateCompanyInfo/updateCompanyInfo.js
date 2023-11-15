import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateCompanyInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hi_id, hiImg } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        let hpIntro;
        if (hi_id > 0) hpIntro = await prisma.homepageIntroduce.findUnique({ where: { hi_id } });

        if (hiImg) {
          const { createReadStream, filename, encoding, mimetype } = await hiImg;
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

          if (hpIntro) {
            // 있으면 수정
            await prisma.homepageIntroduce.update({
              where: { hi_id },
              data: {
                hi_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hi_adminName: loginAdmin.admin_name,
                hi_adminRank: loginAdmin.admin_rank,
                hi_adminId: loginAdmin.admin_id,
              },
            });
          } else {
            // 없으면 생성
            await prisma.homepageIntroduce.create({
              data: {
                hi_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hi_adminName: loginAdmin.admin_name,
                hi_adminRank: loginAdmin.admin_rank,
                hi_adminId: loginAdmin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 회사 소개 변경 실패. updateCompanyInfo", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
