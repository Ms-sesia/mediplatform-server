import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { deleteId, aldyoffdayRepeat } = args;
      try {
        console.log("deleteHospitalOffday: ", args);
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        switch (aldyoffdayRepeat) {
          case "none":
            await prisma.hospitalOffday.update({
              where: { ho_id: deleteId },
              data: {
                ho_editorId: loginUser.user_id,
                ho_editorName: loginUser.user_name,
                ho_editorRank: loginUser.user_rank,
                ho_isDelete: true,
                ho_deleteDate: new Date(),
              },
            });
            break;
          case "week":
            await prisma.weekOffday.update({
              where: { wo_id: deleteId },
              data: {
                wo_editorId: loginUser.user_id,
                wo_editorName: loginUser.user_name,
                wo_editorRank: loginUser.user_rank,
                wo_isDelete: true,
                wo_deleteDate: new Date(),
              },
            });
            break;
          case "month":
            await prisma.monthOffday.update({
              where: { fo_id: deleteId },
              data: {
                fo_editorId: loginUser.user_id,
                fo_editorName: loginUser.user_name,
                fo_editorRank: loginUser.user_rank,
                fo_isDelete: true,
                fo_deleteDate: new Date(),
              },
            });
            break;
        }

        return true;
      } catch (e) {
        console.log("병원 쉬는날 삭제 실패. deleteHospitalOffday", e);
        throw new Error("err_00");
      }
    },
  },
};
