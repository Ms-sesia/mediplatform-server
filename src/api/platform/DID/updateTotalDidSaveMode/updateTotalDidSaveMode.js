import { PrismaClient } from "@prisma/client";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateTotalDidSaveMode: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { saveMode } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        await prisma.did.updateMany({
          where: { hsp_id: user.hospital.hsp_id },
          data: {
            did_editorId: loginUser.user_id,
            did_editorName: loginUser.user_name,
            did_editorRank: loginUser.user_rank,
            did_saveMode: saveMode,
          },
        });

        const updateDidInfo = {
          SendStatus: "allSaveDid", // did 전체 절전 상태
          allDidSaveStatus: saveMode,
        };

        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        await pub.publish(channelName, JSON.stringify(updateDidInfo));

        return true;
      } catch (e) {
        console.log("전체 절전 설정 실패. updateTotalDidSaveMode", e);
        throw new Error("전체 절전 설정에 실패하였습니다.");
      }
    },
  },
};
