import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospital: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        hsp_id,
        hsp_img,
        hsp_name,
        hsp_chief,
        hsp_hospitalNumber,
        hsp_businessNumber,
        hsp_address,
        hsp_detailAddress,
        hsp_medicalDepartment,
        hsp_kakaoChannelId,
        hsp_kakaoChannelUrl,
        hsp_messageTrId,
        hsp_messageSendNum,
      } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../", "images");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id } });

        let hspNewImgUrl;
        // 이미지 업로드
        if (hsp_img) {
          const hsp_fileName = hospital.hsp_img.split("/")[3];
          if (hospital.hsp_img) {
            if (fs.existsSync(`${storagePath}/${hsp_fileName}`)) {
              fs.unlinkSync(`${storagePath}/${hsp_fileName}`);
            }
          }

          const { createReadStream, filename, encoding, mimetype } = await hsp_img;
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
          hspNewImgUrl = `${process.env.LOCALSTORAGEADDR}${fileRename}`;
        }

        await prisma.hospital.update({
          where: { hsp_id },
          data: {
            hsp_editorId: loginUser.user_id,
            hsp_editorName: loginUser.user_name,
            hsp_editorRank: loginUser.user_rank,
            hsp_img: hspNewImgUrl,
            hsp_name,
            hsp_chief,
            hsp_hospitalNumber,
            hsp_businessNumber,
            hsp_address,
            hsp_detailAddress,
            hsp_medicalDepartment,
            hsp_kakaoChannelId,
            hsp_kakaoChannelUrl,
            hsp_messageTrId,
            hsp_messageSendNum,
          },
        });

        return true;
      } catch (e) {
        console.log("병원 정보 수정 실패. updateHospital", e);
        throw new Error("err_00");
      }
    },
  },
};
