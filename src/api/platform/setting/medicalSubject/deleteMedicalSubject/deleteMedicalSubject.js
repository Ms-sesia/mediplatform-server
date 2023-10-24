import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteMedicalSubject: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ms_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.medicalSubject.update({
          where: { ms_id },
          data: {
            ms_editorId: loginUser.user_id,
            ms_editorName: loginUser.user_name,
            ms_editorRank: loginUser.user_rank,
            ms_isDelete: true,
            ms_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("진료항목 대분류 삭제 실패. deleteMedicalSubject", e);
        throw new Error("진료항목 대분류 삭제에 실패하였습니다.");
      }
    },
  },
};
