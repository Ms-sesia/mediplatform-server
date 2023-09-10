import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPatient: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_name, pati_rrn, pati_cellphone, pati_chartNumber } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        await prisma.patient.create({
          data: {
            pati_createdAt: today9,
            pati_updatedAt: today9,
            pati_creatorId: loginUser.user_id,
            pati_creatorName: loginUser.user_name,
            pati_creatorRank: loginUser.user_rank,
            pati_name,
            pati_rrn,
            pati_cellphone,
            pati_chartNumber,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("환자정보 추가 실패. createPatient", e);
        throw new Error("환자정보 추가에 실패하였습니다.");
      }
    },
  },
};
