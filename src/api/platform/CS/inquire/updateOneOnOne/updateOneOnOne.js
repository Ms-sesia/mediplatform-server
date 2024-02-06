import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateOneOnOne: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id, oneq_title, oneq_text, oneq_publicPrivate, attached, deleteAttached } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../../", "files");

        const oneInquire = await prisma.oneOnOne.update({
          where: { oneq_id },
          data: {
            oneq_editorId: loginUser.user_id,
            oneq_editorName: loginUser.user_name,
            oneq_editorRank: loginUser.user_rank,
            oneq_title,
            oneq_text,
            oneq_publicPrivate,
          },
        });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (loginUser.user_id !== oneInquire.oneq_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;

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

        if (deleteAttached.length) {
          for (let i = 0; i < deleteAttached.length; i++) {
            const onefile = await prisma.oneOnOneAttached.findUnique({ where: { oneAt_id: deleteAttached[i] } });
            const fileName = onefile.oneAt_url.split("/")[3];
            if (fs.existsSync(`${storagePath}/${fileName}`)) {
              fs.unlinkSync(`${storagePath}/${fileName}`);
            }
            await prisma.oneOnOneAttached.delete({ where: { oneAt_id: deleteAttached[i] } });
          }
        }

        return true;
      } catch (e) {
        console.log("일대일 문의 수정하기 실패. updateOneOnOne", e);
        throw new Error("err_00");
      }
    },
  },
};
