import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteOrg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { org_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.org.update({
          where: { org_id },
          data: {
            org_editorId: loginUser.user_id,
            org_editorName: loginUser.user_name,
            org_editorRank: loginUser.user_rank,
            org_isDelete: true,
            org_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("조직 삭제 실패. deleteOrg", e);
        throw new Error("조직 삭제에 실패하였습니다.");
      }
    },
  },
};
