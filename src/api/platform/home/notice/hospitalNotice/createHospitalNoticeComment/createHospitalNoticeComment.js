import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospitalNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hn_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.hnComment.create({
          data: {
            hnc_text: text,
            hnc_creatorId: loginUser.user_id,
            hnc_creatorName: loginUser.user_name,
            hnc_creatorRank: loginUser.user_rank,
            hnc_createdAt: today9,
            hospitalNotice: { connect: { hn_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 댓글 작성 실패. createHospitalNoticeComment", e);
        throw new Error("err_00");
      }
    },
  },
};
