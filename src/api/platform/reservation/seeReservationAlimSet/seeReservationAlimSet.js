import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeReservationAlimSet: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        // 로그인한 사용자 알림 세팅 정보
        const userAlimSet = await prisma.userPatientAlimSet.findMany({ where: { user_id: loginUser.user_id } });
        // 병원 알림 세팅 정보
        const hospitalAlimSet = await prisma.alimSet.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        let alimSet = {
          exist: false,
          type: "",
          time1: false,
          time2: false,
          time3: false,
          time4: false,
          templateId: 0,
          template: "",
        };
        // 사용자의 알림셋이 있을 경우
        if (userAlimSet.length) {
          const userTemplate =
            userAlimSet[0].upas_templateId !== 0
              ? await prisma.resAlimTemplate.findUnique({
                  where: { rat_id: userAlimSet[0].upas_templateId },
                })
              : "";
          alimSet = {
            exist: true,
            type: userAlimSet[0].upas_type,
            time1: userAlimSet[0].upas_time1,
            time2: userAlimSet[0].upas_time2,
            time3: userAlimSet[0].upas_time3,
            time4: userAlimSet[0].upas_time4,
            templateId: userAlimSet[0].upas_templateId,
            template: userAlimSet[0].upas_templateId !== 0 ? userTemplate.rat_text : "",
          };
          // 병원에서 설정한 알림셋이 있는경우
        } else if (hospitalAlimSet) {
          const hospitalTemplate =
            hospitalAlimSet.as_templateId !== 0
              ? await prisma.resAlimTemplate.findUnique({
                  where: { rat_id: hospitalAlimSet.as_templateId },
                })
              : "";
          alimSet = {
            exist: true,
            type: hospitalAlimSet.as_type,
            time1: hospitalAlimSet.as_time1,
            time2: hospitalAlimSet.as_time2,
            time3: hospitalAlimSet.as_time3,
            time4: hospitalAlimSet.as_time4,
            templateId: hospitalAlimSet.as_templateId,
            template: hospitalAlimSet.as_templateId !== 0 ? hospitalTemplate.rat_text : "",
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
