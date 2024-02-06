import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePatientMemo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { prm_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const patientMemo = await prisma.patientMemo.findUnique({ where: { prm_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });
        if (loginUser.user_id !== patientMemo.prm_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;

        await prisma.patientMemo.update({
          where: { prm_id },
          data: {
            prm_text: text,
            prm_editorId: loginUser.user_id,
            prm_editorName: loginUser.user_name,
            prm_editorRank: loginUser.user_rank,
          },
        });

        return true;
      } catch (e) {
        console.log("예약자 메모 수정 실패. updatePatientMemo", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
