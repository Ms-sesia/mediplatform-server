import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../generate";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDidMonitor: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        did_title,
        did_monitorType,
        did_mediaType,
        did_resUsed,
        did_transmitType,
        did_resInfoLocation,
        did_monitorRatio,
        did_attached,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const storagePath = path.join(__dirname, "../../../../../", "didMedia");

        let uuid10, monitorUniqueKey;
        const today = new Date().getTime();

        let unique = false;
        while (!unique) {
          uuid10 = genRandomCode(8);

          // 병원id + 오늘날짜 + uuid 10자리
          monitorUniqueKey = `${user.hospital.hsp_id}${today}${uuid10}`;
          // uniqueId 중복 체크
          const checkDidUnique = await prisma.did.findUnique({
            where: { did_uniqueId: monitorUniqueKey },
          });

          // 중복이 없으면
          if (!checkDidUnique) {
            unique = true;
          }
        }

        const did = await prisma.did.create({
          data: {
            did_creatorName: loginUser.user_name,
            did_creatorRank: loginUser.user_rank,
            did_creatorId: loginUser.user_id,
            did_title,
            did_monitorType,
            did_mediaType,
            did_resUsed,
            did_transmitType,
            did_resInfoLocation,
            did_monitorRatio: did_monitorRatio ? did_monitorRatio : "1 : 1",
            did_doctorRoomExpression: "진료실명 - 의사명",
            did_standbyPersonExpression: "00 명",
            did_erColor: "핑크색",
            did_holdingColor: "초록색",
            did_standbyPersonFontsize: "크게",
            did_calledPersonFontsize: "크게",
            did_patExpRatio1: 0,
            did_patExpRatio2: 0,
            did_patExpRatio3: 0,
            did_patExpRatio4: 0,
            did_resInfoTime: 10,
            did_resInfoCycle: 30,
            did_uniqueId: monitorUniqueKey,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        if (did_attached.length) {
          for (let i = 0; i < did_attached.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await did_attached[i];
            console.log(did_attached[i]);
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

            await prisma.didAttached.create({
              data: {
                da_creatorId: loginUser.user_id,
                da_creatorName: loginUser.user_name,
                da_creatorRank: loginUser.user_rank,
                da_number: i + 1,
                da_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                da_fileSize: stats.size ? stats.size : 0,
                da_fileType: mimetype,
                did: { connect: { did_id: did.did_id } },
              },
            });
          }
        }

        const doctorRoom = await prisma.doctorRoom.findMany({ where: { hsp_id: user.hospital.user_id } });

        // 진료실이 있을 경우 did진료실 정보 생성
        if (doctorRoom.length) {
          doctorRoom.map(async (drRoom, idx) => {
            await prisma.didDoctorRoom.create({
              data: {
                ddr_info: `${drRoom.dr_doctorName} ${drRoom.dr_doctorRank}`,
                ddr_number: idx + 1,
                did: { connect: { did_id: did.did_id } },
              },
            });
          });
        }

        return true;
      } catch (e) {
        console.log("did모니터 등록 실패. createDidMonitor", e);
        throw new Error("did모니터 등록에 실패하였습니다.");
      }
    },
  },
};
