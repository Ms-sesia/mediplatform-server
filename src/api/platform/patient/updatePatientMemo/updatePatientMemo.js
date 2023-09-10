import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePatientMemo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { prm_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.patientMemo.update({
          where: { prm_id },
          data: {
            prm_updatedAt: today9,
            prm_editorId: loginUser.user_id,
            prm_editorName: loginUser.user_name,
            prm_editorRank: loginUser.user_rank,
            prm_text: text,
          },
        });

        return true;
      } catch (e) {
        console.log("환자 메모 수정 실패. updatePatientMemo", e);
        throw new Error("err_00");
      }
    },
  },
};
