import { PrismaClient } from "@prisma/client";
import { genDidUnique } from "../../../generate";
import webSocket from "../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        await prisma.notiHistory.create({
          data: {
            ng_text: `테스트 노티 생성.`,
            user: { connect: { user_id: 1 } },
          },
        });

        // await sendEmail("y
        // Noti 알림 설정
        const alimInfo = {
          SendStatus: "alim",
          alimType: "platformNotice",
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const hospitals = await prisma.hospital.findMany({
          where: { NOT: { hsp_isDelete: true } },
        });

        hospitals.forEach(async (hospital) => {
          const channelName = `h-${hospital.hsp_email}`;

          await pub.publish(channelName, JSON.stringify(alimInfo));
        });
        return true;
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};
