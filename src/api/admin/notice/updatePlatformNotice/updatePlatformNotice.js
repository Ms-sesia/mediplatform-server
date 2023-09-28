import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePlatformNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id, type, title, text, deleteAttachedIds, noticeAttached } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const platformNotice = await prisma.platformNotice.update({
          where: { pn_id },
          data: {
            pn_updatedAt: today9,
            pn_adminEditorId: loginAdmin.admin_id,
            pn_adminEditorName: loginAdmin.admin_name,
            pn_adminEditorRank: loginAdmin.admin_rank,
            pn_type: type,
            pn_title: title,
            pn_text: text,
          },
        });

        if (deleteAttachedIds.length) {
          for (let i = 0; i < deleteAttachedIds.length; i++) {
            const pnAttached = await prisma.pnAttached.findUnique({
              where: { pna_id: deleteAttachedIds[i] },
              select: { pna_id: true, pna_url: true },
            });

            if (fs.existsSync(`${storagePath}/${pnAttached.pna_url.split("/")[3]}`)) {
              fs.unlinkSync(`${storagePath}/${pnAttached.pna_url.split("/")[3]}`);
            }
            // 삭제할 데이터
            await prisma.pnAttached.delete({
              where: { pna_id: deleteAttachedIds[i] },
            });
          }
        }

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
        console.log("플랫폼 공지 수정 실패. updatePlatformNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
