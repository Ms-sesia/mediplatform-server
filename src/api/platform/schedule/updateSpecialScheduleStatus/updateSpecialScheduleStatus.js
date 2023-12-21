import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateSpecialScheduleStatus: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ss_id, status } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.specialSchedule.update({
          where: { ss_id },
          data: {
            ss_editorId: loginUser.user_id,
            ss_editorName: loginUser.user_name,
            ss_editorRank: loginUser.user_rank,
            ss_status: status,
            specialScheduleHistory: {
              create: {
                ssh_creatorId: loginUser.user_id,
                ssh_creatorName: loginUser.user_name,
                ssh_creatorRank: loginUser.user_rank,
                ssh_type: "history",
                ssh_confirmStatus: status,
                ssh_text: `${loginUser.user_name}님이 ${convSSStatus(status)}을(를) 했습니다.`,
              },
            },
          },
        });

        return true;
      } catch (e) {
        console.log("특별일정 결재 상태 변경 실패. updateSpecialScheduleStatus", e);
        throw new Error("err_00");
      }
    },
  },
};

const convSSStatus = (status) => {
  let convStatus;
  switch (status) {
    case "notSign":
      convStatus = "승인전";
      break;
    case "sign":
      convStatus = "승인";
      break;
    case "reject":
      convStatus = "반려";
      break;
  }

  return convStatus;
};
