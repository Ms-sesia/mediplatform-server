import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDoctorRoomSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { drs_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.doctorRoomSchedule.update({
          where: { drs_id },
          data: {
            drs_updatedAt: today9,
            drs_editorId: loginUser.user_id,
            drs_editorName: loginUser.user_name,
            drs_editorRank: loginUser.user_rank,
            drs_isDelete: true,
            drs_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("진료실 스케쥴 삭제 실패. deleteDoctorRoomSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};
