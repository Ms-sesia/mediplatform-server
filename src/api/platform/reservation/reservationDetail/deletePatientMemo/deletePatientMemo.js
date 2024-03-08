import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deletePatientMemo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { prm_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const patientMemo = await prisma.patientMemo.findUnique({ where: { prm_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (loginUser.user_id !== patientMemo.prm_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;

        await prisma.patientMemo.update({
          where: { prm_id },
          data: {
            prm_editorId: loginUser.user_id,
            prm_editorName: loginUser.user_name,
            prm_editorRank: loginUser.user_rank,
            prm_isDelete: true,
            prm_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("예약자 메모 삭제 실패. deletePatientMemo", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
