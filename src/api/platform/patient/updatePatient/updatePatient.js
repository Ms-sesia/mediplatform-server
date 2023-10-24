import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePatient: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_id, name, rrn, cellphone, chartNumber } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.patient.update({
          where: { pati_id },
          data: {
            pati_editorId: loginUser.user_id,
            pati_editorName: loginUser.user_name,
            pati_editorRank: loginUser.user_rank,
            pati_name: name,
            pati_rrn: rrn,
            pati_cellphone: cellphone,
            pati_chartNumber: chartNumber,
          },
        });

        return true;
      } catch (e) {
        console.log("환자 정보 수정 실패. updatePatient", e);
        throw new Error("err_00");
      }
    },
  },
};
