import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeReservationAlimSet: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const userAlimSet = await prisma.userPatientAlimSet.findMany({ where: { user_id: loginUser.user_id } });
        const hospitalAlimSet = await prisma.alimSet.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        let alimSet = {
          exist: false,
          type: "",
          time1: false,
          time2: false,
          time3: false,
          time4: false,
          template: "",
        };
        if (userAlimSet.length) {
          const userTemplate = await prisma.resAlimTemplate.findUnique({
            where: { rat_id: userAlimSet[0].upas_templateId },
          });
          alimSet = {
            exist: true,
            type: userAlimSet[0].upas_type,
            time1: userAlimSet[0].upas_time1,
            time2: userAlimSet[0].upas_time2,
            time3: userAlimSet[0].upas_time3,
            time4: userAlimSet[0].upas_time4,
            template: userTemplate.rat_text,
          };
        } else if (hospitalAlimSet) {
          const hospitalTemplate = await prisma.resAlimTemplate.findUnique({
            where: { rat_id: hospitalAlimSet.as_templateId },
          });
          alimSet = {
            exist: true,
            type,
            time1,
            time2,
            time3,
            time4,
            template: hospitalTemplate.rat_text,
          };
        }

        return alimSet;
      } catch (e) {
        console.log("알림 설정 정보 내용 조회 실패. seeReservationAlimSet ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
