import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createMedicalSubject: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ms_name } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.medicalSubject.create({
          data: {
            ms_creatorId: loginUser.user_id,
            ms_creatorName: loginUser.user_name,
            ms_creatorRank: loginUser.user_rank,
            ms_name,
            hospital: { connect: { hsp_id: loginUser.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("진료항목 대분류 등록 실패. createMedicalSubject", e);
        throw new Error("진료항목 대분류 등록에 실패하였습니다.");
      }
    },
  },
};
