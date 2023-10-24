import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deletePatient: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.patient.update({
          where: { pati_id },
          data: {
            pati_editorId: loginUser.user_id,
            pati_editorName: loginUser.user_name,
            pati_editorRank: loginUser.user_rank,
            pati_isDelete: true,
            pati_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("환자 정보 삭제 실패. deletePatient", e);
        throw new Error("err_00");
      }
    },
  },
};
