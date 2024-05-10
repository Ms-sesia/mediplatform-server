import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHPCs: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hcs_id, img } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        const hcs = await prisma.homepageCS.findFirst();

        if (img) {
          const { createReadStream, filename, encoding, mimetype } = await img;
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

          if (hcs) {
            // 있으면 수정
            await prisma.homepageCS.update({
              where: { hcs_id: hcs.hcs_id },
              data: {
                hcs_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hcs_adminName: loginAdmin.admin_name,
                hcs_adminRank: loginAdmin.admin_rank,
                hcs_adminId: loginAdmin.admin_id,
              },
            });
          } else {
            // 없으면 생성
            await prisma.homepageCS.create({
              data: {
                hcs_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hcs_adminName: loginAdmin.admin_name,
                hcs_adminRank: loginAdmin.admin_rank,
                hcs_adminId: loginAdmin.admin_id,
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("홈페이지 고객지원 이미지 수정(등록) 실패. updateHPCs", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
