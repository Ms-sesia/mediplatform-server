import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateDoctorRoom: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dr_id, dr_deptCode, dr_roomName, dr_doctorName, dr_doctorRank } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.doctorRoom.update({
          where: { dr_id },
          data: {
            dr_editorName: loginUser.user_name,
            dr_editorRank: loginUser.user_rank,
            dr_editorId: loginUser.user_id,
            dr_deptCode,
            dr_roomName,
            dr_doctorName,
            dr_doctorRank,
          },
        });

        return true;
      } catch (e) {
        console.log("진료실 수정 실패. createDoctorRoom", e);
        throw new Error("진료실 수정에 실패하였습니다.");
      }
    },
  },
};
