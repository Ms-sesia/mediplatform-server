import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import sendEmail from "../../../../libs/sendEmail";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createSpecialSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dr_id, type, startDate, endDate, subDoctorUsed, startTime, endTime, memo, attached } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const storagePath = path.join(__dirname, "../../../../../", "files");
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        const doctorRoom = await prisma.doctorRoom.findUnique({ where: { dr_id } });

        const start = new Date(startDate);
        const end = type === "offDay" ? new Date(startDate) : new Date(endDate);

        const specialSchedule = await prisma.specialSchedule.create({
          data: {
            ss_creatorId: loginUser.user_id,
            ss_creatorName: loginUser.user_name,
            ss_creatorRank: loginUser.user_rank,
            ss_doctorName: doctorRoom.dr_doctorName,
            ss_doctorRoomName: doctorRoom.dr_roomName,
            ss_type: type,
            ss_startDate: start,
            ss_endDate: end,
            ss_subDoctorUsed: subDoctorUsed,
            ss_startTime: startTime,
            ss_endTime: endTime,
            ss_memo: memo,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
            doctorRoom: { connect: { dr_id } },
            specialScheduleHistory: {
              create: {
                ssh_creatorId: loginUser.user_id,
                ssh_creatorName: loginUser.user_name,
                ssh_creatorRank: loginUser.user_rank,
                ssh_text: `${loginUser.user_name}님이 특별일정을 등록했습니다.`,
              },
            },
          },
        });

        if (attached && attached.length) {
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

        const sendUsers = await prisma.user.findMany({ where: { hsp_id: user.hospital.hsp_id } });

        const sendTitle = `[메디플랫폼] 특별일정 등록 안내`;
        const sendText = `안녕하세요. 메디플랫폼입니다.<br>
        병원에 새로운 특별일정이 등록되었습니다. 확인바랍니다.<br>
        `;

        for (const sendUser of sendUsers) {
          try {
            const email = sendUser.user_email;
            await prisma.notiHistory.create({
              data: {
                ng_text: `병원에 새로운 특별일정이 등록되었습니다.`,
                user: { connect: { user_id: sendUser.user_id } },
              },
            });
            await sendEmail(email, sendTitle, sendText);
          } catch (error) {
            console.error(`사내공지 등록 알림 메일 발송 에러. createSpecialSchedule ==> ${error}`);
            throw 1;
          }
          await delay(0.1); // 1ms (0.0001초) 지연
        }

        // Noti 알림 설정
        const alimInfo = {
          SendStatus: "alim",
          alimType: "specialSchedule",
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        await pub.publish(channelName, JSON.stringify(alimInfo));

        return true;
      } catch (e) {
        console.log("진료실 특별일정 추가 실패. createSpecialSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
