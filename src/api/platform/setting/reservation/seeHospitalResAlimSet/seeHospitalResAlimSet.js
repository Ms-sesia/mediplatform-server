import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalResAlimSet: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hspAlimSet = await prisma.alimSet.findFirst({
          where: { hospital: { hsp_id: user.hospital.hsp_id } },
        });

        const templateList = await prisma.resAlimTemplate.findMany({
          where: { AND: [{ hospital: { hsp_id: user.hospital.hsp_id } }, { rat_isDelete: false }] },
          orderBy: { rat_title: "asc" },
        });

        const result = {
          as_id: hspAlimSet.as_id,
          as_type: hspAlimSet.as_type,
          as_time1: hspAlimSet.as_time1,
          as_time2: hspAlimSet.as_time2,
          as_time3: hspAlimSet.as_time3,
          as_time4: hspAlimSet.as_time4,
          as_templateId: hspAlimSet.as_templateId,
          templateList: templateList.length ? templateList : [],
        };

        return result;
      } catch (e) {
        console.log("예약 알림 발송 설정 실패. seeHospitalResAlimSet", e);
        throw new Error("err_00");
      }
    },
  },
};
