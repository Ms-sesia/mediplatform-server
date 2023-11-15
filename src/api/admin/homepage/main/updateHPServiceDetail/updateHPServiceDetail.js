import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHPServiceDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsd_id, detailImg } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        let hpServiceDetail;
        if (hsd_id > 0) hpServiceDetail = await prisma.homepageServiceDetail.findUnique({ where: { hsd_id } });

        if (detailImg) {
          const { createReadStream, filename, encoding, mimetype } = await detailImg;
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

          if (hpServiceDetail) {
            // 있으면 수정
            await prisma.homepageServiceDetail.update({
              where: { hsd_id },
              data: {
                hsd_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hsd_adminName: loginAdmin.admin_name,
                hsd_adminRank: loginAdmin.admin_rank,
                hsd_adminId: loginAdmin.admin_id,
              },
            });
          } else {
            // 없으면 생성
            await prisma.homepageServiceDetail.create({
              data: {
                hsd_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hsd_adminName: loginAdmin.admin_name,
                hsd_adminRank: loginAdmin.admin_rank,
                hsd_adminId: loginAdmin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 상세이미지 수정(등록) 실패. updateHPServiceDetail", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
