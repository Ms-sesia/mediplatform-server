import { PrismaClient } from "@prisma/client";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateDidSaveMode: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { did_id, saveMode } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const updatedDid = await prisma.did.update({
          where: { did_id },
          data: {
            did_editorId: loginUser.user_id,
            did_editorName: loginUser.user_name,
            did_editorRank: loginUser.user_rank,
            did_saveMode: saveMode,
          },
        });

        const updateDidInfo = {
          SendStatus: "saveDid", // 개별 절전
          didSaveStatus: saveMode,
        };

        const socketIo = await webSocket();
        const pub = socketIo.pub;

        await pub.publish(updatedDid.did_uniqueId, JSON.stringify(updateDidInfo));

        return true;
      } catch (e) {
        console.log("개별 절전 설정 실패. updateDidSaveMode", e);
        throw new Error("개별 절전 설정에 실패하였습니다.");
      }
    },
  },
};
