import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import webSocket from "../../../../libs/webSocket/webSocket";
import sendEmail from "../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPlatformNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { type, title, text, noticeAttached } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const platformNotice = await prisma.platformNotice.create({
          data: {
            pn_adminCreatorId: loginAdmin.admin_id,
            pn_adminCreatorName: loginAdmin.admin_name,
            pn_adminCreatorRank: loginAdmin.admin_rank,
            pn_type: type,
            pn_title: title,
            pn_text: text,
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

            await prisma.pnAttached.create({
              data: {
                pna_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                pna_fileType: mimetype,
                pna_fileSize: stats.size ? stats.size : 0,
                platformNotice: { connect: { pn_id: platformNotice.pn_id } },
              },
            });
          }
        }

        // 삭제되지 않은 사용자, 알림을 켜둔 사용자
        const sendUsers = await prisma.user.findMany({
          where: { AND: [{ user_isDelete: false }, { user_hnAlim: true }] },
        });

        const sendTitle = `[메디플랫폼] 플랫폼 공지사항 등록 안내`;
        const sendText = `안녕하세요. 메디플랫폼입니다.<br>
        플랫폼 공지사항 "${title}"이 등록되었으니 확인바랍니다.<br>
        `;

        for (const sendUser of sendUsers) {
          // try {
          const email = sendUser.user_email;
          await prisma.notiHistory.create({
            data: {
              ng_text: `새로운 플랫폼 공지사항 "${title}"이(가) 등록되었습니다.`,
              user: { connect: { user_id: sendUser.user_id } },
            },
          });
          // await sendEmail(email, sendTitle, sendText);
          // } catch (error) {
          //   console.error(`플랫폼공지 등록 알림 메일 발송 에러. createPlatformNotice ==> ${error}`);
          //   throw 1;
          // }
          // await delay(0.1); // 1ms (0.0001초) 지연
        }

        // Noti 알림 설정
        const alimInfo = {
          SendStatus: "alim",
          alimType: "platformNotice",
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const findUsers = await prisma.user.findMany({ where: { NOT: { user_isDelete: true } } });
        const convType = convPNType(type);

        for (let i = 0; i < findUsers.length; i++) {
          await prisma.notiHistory.create({
            data: {
              ng_text: `플랫폼 공지 '[${convType}]${title}'이(가) 등록되었습니다.`,
              user: { connect: { user_id: findUsers[i].user_id } },
            },
          });
        }

        const hospitals = await prisma.hospital.findMany({
          where: { NOT: { hsp_isDelete: true } },
        });

        hospitals.forEach(async (hospital) => {
          const channelName = `h-${hospital.hsp_email}`;

          await pub.publish(channelName, JSON.stringify(alimInfo));
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 작성 실패. createPlatformNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 플랫폼 공지 타입 한글 변환
const convPNType = (type) => {
  switch (type) {
    case "normal":
      return "플랫폼 일반공지";
    case "emergency":
      return "긴급";
    case "update":
      return "업데이트";
  }
};
