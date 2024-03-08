import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import sendEmail from "../../../../../../libs/sendEmail";
import webSocket from "../../../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { title, text, noticeAttached } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../../", "files");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({
          where: { hsp_id: user.hospital.hsp_id },
        });

        const hospitalNotice = await prisma.hospitalNotice.create({
          data: {
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

        // 알림 발송 할 병원, 삭제되지 않은 사용자, 알림을 켜둔 사용자
        const sendUsers = await prisma.user.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { NOT: { user_isDelete: true } }, { user_hnAlim: true }] },
        });

        const sendTitle = `[메디플랫폼] 사내 공지사항 등록 안내`;
        const sendText = `안녕하세요. 메디플랫폼입니다.<br>
        사내공지사항 "${title}"이 등록되었으니 확인바랍니다.<br>
        `;

        for (const sendUser of sendUsers) {
          await prisma.notiHistory.create({
            data: {
              ng_text: `새로운 사내공지사항 "${title}"이(가) 등록되었습니다.`,
              user: { connect: { user_id: sendUser.user_id } },
            },
          });
        }

        const sendEmails = sendUsers.map((su) => su.user_email);
        const joinEmails = sendEmails.join();

        await sendEmail(joinEmails, sendTitle, sendText);

        // Noti 알림 설정
        const alimInfo = {
          SendStatus: "alim",
          alimType: "hospitalNotice",
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        await pub.publish(channelName, JSON.stringify(alimInfo));

        return true;
      } catch (e) {
        console.log("사내공지 작성 실패. createHospitalNotice", e);
        throw new Error("err_00");
      }
    },
  },
};
