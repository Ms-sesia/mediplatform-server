import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createMedicalSubjectDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ms_id, msd_name } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const findMedicalSubDetail = await prisma.medicalSubjectDetail.findMany({
          where: { AND: [{ ms_id }, { msd_name }] },
        });

        if (findMedicalSubDetail.length) throw 1;

        await prisma.medicalSubjectDetail.create({
          data: {
            msd_creatorId: loginUser.user_id,
            msd_creatorName: loginUser.user_name,
            msd_creatorRank: loginUser.user_rank,
            msd_name,
            medicalSubject: { connect: { ms_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("진료항목 소분류 등록 실패. createMedicalSubjectDetail", e);
        if (e === 1) throw new Error("err_01"); // 이미 등록된 이름입니다.
        throw new Error("진료항목 소분류 등록에 실패하였습니다.");
      }
    },
  },
};
