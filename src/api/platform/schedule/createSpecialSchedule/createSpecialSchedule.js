import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createSpecialSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        dr_id,
        startDate,
        endDate,
        subDoctorUsed,
        startTime,
        endTime,
        memo,
        attached,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../", "files");

        const doctorRoom = await prisma.doctorRoom.findUnique({ where: { dr_id } });

        const start = new Date(startDate);
        const end = new Date(endDate);

        const specialSchedule = await prisma.specialSchedule.create({
          data: {
            ss_createdAt: today9,
            ss_updatedAt: today9,
            ss_creatorId: loginUser.user_id,
            ss_creatorName: loginUser.user_name,
            ss_creatorRank: loginUser.user_rank,
            ss_doctorName: doctorRoom.dr_doctorName,
            ss_doctorRoomName: doctorRoom.dr_roomName,
            ss_startDate: start,
            ss_endDate: end,
            ss_subDoctorUsed: subDoctorUsed,
            ss_startTime: startTime,
            ss_endTime: endTime,
            ss_memo: memo,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
            doctorRoom: { connect: { dr_id } },
          },
        });

        if (attached.length) {
          for (let i = 0; i < attached.length; i++) {
            const { createReadStream, filename, encoding, mimetype } = await attached[i];
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

            await prisma.specialScheduleAttacthed.create({
              data: {
                sa_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                sa_fileSize: stats.size ? stats.size : 0,
                sa_fileType: mimetype,
                specialSchedule: { connect: { ss_id: specialSchedule.ss_id } },
              },
            });
          }
        }

        return true;
      } catch (e) {
        console.log("진료실 특별일정 추가 실패. createSpecialSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};
