import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPatientMemo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.patientMemo.create({
          data: {
            prm_creatorId: loginUser.user_id,
            prm_creatorName: loginUser.user_name,
            prm_creatorRank: loginUser.user_rank,
            prm_text: text,
            patient: { connect: { pati_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("환자 메모 작성 실패. createPatientMemo", e);
        throw new Error("err_00");
      }
    },
  },
};
