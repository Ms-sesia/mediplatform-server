import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDefaultSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ds_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.defaultSchedule.update({
          where: { ds_id },
          data: {
            ds_editorId: loginUser.user_id,
            ds_editorName: loginUser.user_name,
            ds_editorRank: loginUser.user_rank,
            ds_deleteDate: today9,
            ds_isDelete: true,
          },
        });

        return true;
      } catch (e) {
        console.log("병원 기본 스케쥴 삭제 실패. deleteDefaultSchedule", e);
        throw new Error("병원 기본 스케쥴 삭제에 실패하였습니다.");
      }
    },
  },
};
