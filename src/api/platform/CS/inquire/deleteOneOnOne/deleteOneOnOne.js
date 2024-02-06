import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteOneOnOne: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const inquire = await prisma.oneOnOne.findUnique({ where: { oneq_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (loginUser.user_id !== inquire.oneq_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;

        await prisma.oneOnOne.update({
          where: { oneq_id },
          data: {
            oneq_editorId: loginUser.user_id,
            oneq_editorName: loginUser.user_name,
            oneq_editorRank: loginUser.user_rank,
            oneq_isDelete: true,
            oneq_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 삭제하기 실패. deleteOneOnOne", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
