import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHospitalNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hnc_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hnc = await prisma.hnComment.findUnique({ where: { hnc_id } });

        if (loginUser.user_id !== hnc.hnc_creatorId) throw 1;

        await prisma.hnComment.update({
          where: { hnc_id },
          data: {
            hnc_isDelete: true,
            hnc_deleteDate: new Date(),
            hnc_editorId: loginUser.user_id,
            hnc_editorName: loginUser.user_name,
            hnc_editorRank: loginUser.user_rank,
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 댓글 작성 실패. deleteHospitalNoticeComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
