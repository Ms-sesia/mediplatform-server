import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateResAlimSet: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { as_id, as_type, as_time1, as_time2, as_time3, as_time4, as_templateId } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.alimSet.update({
          where: { as_id },
          data: {
            as_type,
            as_time1,
            as_time2,
            as_time3,
            as_time4,
            as_templateId,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("예약 알림 발송 설정 실패. updateResAlimSet", e);
        throw new Error("err_00");
      }
    },
  },
};
