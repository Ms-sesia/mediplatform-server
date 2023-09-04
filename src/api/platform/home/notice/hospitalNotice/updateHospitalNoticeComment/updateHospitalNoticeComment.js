import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospitalNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hnc_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospitalNoticeComment = await prisma.hnComment.findUnique({ where: { hnc_id } });

        if (loginUser.user_id !== hospitalNoticeComment.hnc_creatorId) throw 1;

        await prisma.hnComment.update({
          where: { hnc_id },
          data: {
            hnc_text: text,
            hnc_editorId: loginUser.user_id,
            hnc_editorName: loginUser.user_name,
            hnc_editorRank: loginUser.user_rank,
            hnc_updatedAt: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 수정 실패. updateHospitalNoticeComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
