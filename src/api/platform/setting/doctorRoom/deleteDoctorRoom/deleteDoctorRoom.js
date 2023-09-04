import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDoctorRoom: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dr_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const doctorRoom = await prisma.doctorRoom.update({
          where: { dr_id },
          data: {
            dr_editorName: loginUser.user_name,
            dr_editorRank: loginUser.user_rank,
            dr_editorId: loginUser.user_id,
            dr_isDelete: true,
            dr_deleteDate: today9,
          },
        });

        // 병원의 didDoctorRoom 삭제
        await prisma.didDoctorRoom.updateMany({
          where: {
            AND: [{ ddr_doctorRoomName: { contains: doctorRoom.dr_roomName } }, { did: { hsp_id: doctorRoom.hsp_id } }],
          },
          data: { ddr_isDelete: true, ddr_deleteDate: today9 },
        });

        return true;
      } catch (e) {
        console.log("진료실 수정 실패. deleteDoctorRoom", e);
        throw new Error("진료실 수정에 실패하였습니다.");
      }
    },
  },
};
