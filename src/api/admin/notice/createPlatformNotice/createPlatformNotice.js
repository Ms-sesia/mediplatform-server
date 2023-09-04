import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPlatformNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { type, title, text, noticeAttached } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const platformNotice = await prisma.platformNotice.create({
          data: {
            pn_createdAt: today9,
            pn_adminCreatorId: loginAdmin.admin_id,
            pn_adminCreatorName: loginAdmin.admin_name,
            pn_adminCreatorRank: loginAdmin.admin_rank,
            pn_type: type,
            pn_title: title,
            pn_text: text,
          },
        });

        if (noticeAttached.length) {
          for (let i = 0; i < noticeAttached.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await noticeAttached[i];
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

            await prisma.pnAttached.create({
              data: {
                pna_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                pna_fileType: mimetype,
                pna_fileSize: stats.size ? stats.size : 0,
                platformNotice: { connect: { pn_id: platformNotice.pn_id } },
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("플랫폼 공지 작성 실패. createPlatformNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
