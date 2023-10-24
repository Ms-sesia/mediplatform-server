import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteSpecialScheduleComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ssh_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const ssh = await prisma.specialScheduleHistory.findUnique({ where: { ssh_id } });
        if (ssh.ssh_creatorId !== loginUser.user_id) throw 1;

        await prisma.specialScheduleHistory.update({
          where: { ssh_id },
          data: {
            ssh_editorId: loginUser.user_id,
            ssh_editorName: loginUser.user_name,
            ssh_editorRank: loginUser.user_rank,
            ssh_isDelete: true,
            ssh_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("특별일정 댓글 삭제 실패. deleteSpecialScheduleComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
