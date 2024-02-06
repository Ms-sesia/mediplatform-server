import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hn_id, title, text, updateAttached, deleteAttached } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../../", "files");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospitalNotice = await prisma.hospitalNotice.findUnique({ where: { hn_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (loginUser.user_id !== hospitalNotice.hn_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;
        
        if (deleteAttached.length) {
          for (let i = 0; i < deleteAttached.length; i++) {
            const deleteHna = await prisma.hnAttached.findUnique({
              where: { hna_id: deleteAttached[i] },
              select: { hna_url: true },
            });

            if (deleteHna) {
              const urlFileName = deleteHna.hna_url.split("/")[3];
              if (fs.existsSync(`${storagePath}/${urlFileName}`)) {
                fs.unlinkSync(`${storagePath}/${urlFileName}`);
              }

              await prisma.hnAttached.delete({
                where: { hna_id: deleteAttached[i] },
              });
            }
          }
        }

        if (updateAttached.length) {
          for (let i = 0; i < updateAttached.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await updateAttached[i];
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

            await prisma.hnAttached.create({
              data: {
                han_fileSize: stats.size ? stats.size : 0,
                han_fileType: mimetype,
                hna_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                hospitalNotice: { connect: { hn_id } },
              },
            });
          }
        }

        await prisma.hospitalNotice.update({
          where: { hn_id },
          data: {
            hn_editorId: loginUser.user_id,
            hn_editorName: loginUser.user_name,
            hn_editorRank: loginUser.user_rank,
            hn_title: title,
            hn_text: text,
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 작성 실패. updateHospitalNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
