import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createServiceImg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsi_serviceType, hsi_detailTabName, hpServiceImgs } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const storagePath = path.join(__dirname, "../../../../../../", "images");
        if (hpServiceImgs.length > 3) throw 2;

        if (hpServiceImgs.length) {
          for (let i = 0; i < hpServiceImgs.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await hpServiceImgs[i];
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

            await prisma.homepageServiceImg.create({
              data: {
                hsi_img: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hsi_serviceType,
                hsi_detailTabName,
                hsi_imgSize: stats.size ? stats.size : 0,
                hsi_imgType: mimetype,
                hsi_adminName: admin.admin_name,
                hsi_adminRank: admin.admin_rank,
                hsi_adminId: admin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 이미지 추가 실패. createDidMonitor ==> \n", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02");
        throw new Error("err_00");
      }
    },
  },
};
