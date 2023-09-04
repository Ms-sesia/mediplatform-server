import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { title, text, noticeAttached } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hospitalNotice = await prisma.hospitalNotice.create({
          data: {
            hn_createdAt: today9,
            hn_creatorId: loginUser.user_id,
            hn_creatorName: loginUser.user_name,
            hn_creatorRank: loginUser.user_rank,
            hn_title: title,
            hn_text: text,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
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

            await prisma.hnAttached.create({
              data: {
                hna_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                han_fileType: mimetype,
                han_fileSize: stats.size ? stats.size : 0,
                hospitalNotice: { connect: { hn_id: hospitalNotice.hn_id } },
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("사내공지 작성 실패. createHospitalNotice", e);
        throw new Error("err_00");
      }
    },
  },
};
