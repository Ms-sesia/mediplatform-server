import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteFAQ: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { faq_id } = args;
      try {
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        if (!loginAdmin) throw 1;

        await prisma.faq.update({
          where: { faq_id },
          data: {
            faq_updatedAt: today9,
            faq_adminEditorId: loginAdmin.admin_id,
            faq_adminEditorName: loginAdmin.admin_name,
            faq_adminEditorRank: loginAdmin.admin_rank,
            faq_deleteDate: today9,
            faq_isDelete: true,
          },
        });

        return true;
      } catch (e) {
        console.log("자주묻는질문 등록 실패. deleteFAQ", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
