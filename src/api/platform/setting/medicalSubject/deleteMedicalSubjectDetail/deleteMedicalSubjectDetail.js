import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteMedicalSubjectDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { msd_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const today9 = new Date(new Date().setHours(new Date().getHours() + 9));

        await prisma.medicalSubjectDetail.update({
          where: { msd_id },
          data: {
            msd_editorId: loginUser.user_id,
            msd_editorName: loginUser.user_name,
            msd_editorRank: loginUser.user_rank,
            msd_isDelete: true,
            msd_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("진료항목 소분류 삭제 실패. deleteMedicalSubjectDetail", e);
        throw new Error("진료항목 소분류 삭제에 실패하였습니다.");
      }
    },
  },
};
