import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateSpecialSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        ss_id,
        dr_id,
        type,
        startDate,
        endDate,
        subDoctorUsed,
        startTime,
        endTime,
        memo,
        attached,
        deleteAttachedIds,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../", "files");

        const doctorRoom = await prisma.doctorRoom.findUnique({ where: { dr_id } });

        const start = new Date(startDate);
        const end = type === "offDay" ? new Date(startDate) : new Date(endDate);
        // const end = new Date(endDate);

        const specialSchedule = await prisma.specialSchedule.update({
          where: { ss_id },
          data: {
            ss_editorId: loginUser.user_id,
            ss_editorName: loginUser.user_name,
            ss_editorRank: loginUser.user_rank,
            ss_doctorName: doctorRoom.dr_doctorName,
            ss_doctorRoomName: doctorRoom.dr_roomName,
            ss_type: type,
            ss_startDate: start,
            ss_endDate: end,
            ss_subDoctorUsed: subDoctorUsed,
            ss_startTime: startTime,
            ss_endTime: endTime,
            ss_memo: memo,
          },
        });

        if (deleteAttachedIds.length) {
          deleteAttachedIds.forEach(async (sa_id) => {
            const ssaUrl = (await prisma.specialScheduleAttacthed.findUnique({ where: { sa_id } })).sa_url;
            const fileName = ssaUrl.split("/")[3];

            if (fs.existsSync(`${storagePath}/${fileName}`)) {
              // console.log("존재");
              fs.unlinkSync(`${storagePath}/${fileName}`);
            }

            await prisma.specialScheduleAttacthed.delete({ where: { sa_id } });
          });
        }

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
        console.log("진료실 특별일정 수정 실패. updateSpecialSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};
