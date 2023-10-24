import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteResAlimTemplate: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { rat_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.resAlimTemplate.update({
          where: { rat_id },
          data: {
            rat_editorId: loginUser.user_id,
            rat_editorName: loginUser.user_name,
            rat_editorRank: loginUser.user_rank,
            rat_isDelete: true,
            rat_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("예약자 추가(등록) 실패. deleteResAlimTemplate", e);
        throw new Error("err_00");
      }
    },
  },
};
