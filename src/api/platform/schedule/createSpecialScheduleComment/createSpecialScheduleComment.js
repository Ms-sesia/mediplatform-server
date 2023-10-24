import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createSpecialScheduleComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ss_id, ssh_text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.specialScheduleHistory.create({
          data: {
            ssh_creatorId: loginUser.user_id,
            ssh_creatorName: loginUser.user_name,
            ssh_creatorRank: loginUser.user_rank,
            ssh_creatorImg: loginUser.user_img,
            ssh_type: "comment",
            ssh_text,
            specialSchedule: { connect: { ss_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("특별일정 댓글 등록 실패. createSpecialScheduleComment", e);
        throw new Error("err_00");
      }
    },
  },
};
