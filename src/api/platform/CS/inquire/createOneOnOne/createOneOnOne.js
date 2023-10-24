import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createOneOnOne: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_title, oneq_text, oneq_publicPrivate, attached } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../../", "files");

        const oneInquire = await prisma.oneOnOne.create({
          data: {
            oneq_creatorId: loginUser.user_id,
            oneq_creatorName: loginUser.user_name,
            oneq_creatorRank: loginUser.user_rank,
            oneq_title,
            oneq_text,
            oneq_publicPrivate,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        if (attached.length) {
          for (let i = 0; i < attached.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await attached[i];

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

            await prisma.oneOnOneAttached.create({
              data: {
                oneAt_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                oneAt_fileType: mimetype,
                oneAt_fileSize: stats.size ? stats.size : 0,
                oneOnOne: { connect: { oneq_id: oneInquire.oneq_id } },
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("일대일 문의 등록하기 실패. createOneOnOne", e);
        throw new Error("err_00");
      }
    },
  },
};
