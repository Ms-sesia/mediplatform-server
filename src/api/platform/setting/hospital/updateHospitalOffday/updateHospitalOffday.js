import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { updateId, aldyoffdayRepeat, offdayRepeat, offStartDate, offEndDate, offStartTime, offEndTime, memo } =
        args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const start = new Date(offStartDate);
        const end = new Date(offEndDate);

        switch (aldyoffdayRepeat) {
          case "none":
            if (offdayRepeat === "none")
              await prisma.hospitalOffday.update({
                where: { ho_id: updateId },
                data: {
                  ho_editorId: loginUser.user_id,
                  ho_editorName: loginUser.user_name,
                  ho_editorRank: loginUser.user_rank,
                  ho_offStartDate: start,
                  ho_offEndDate: end,
                  ho_offStartTime: offStartTime,
                  ho_offEndTime: offEndTime,
                  ho_memo: memo,
                },
              });
            if (offdayRepeat === "week") {
              // 임시 휴무 데이터 삭제
              await prisma.hospitalOffday.update({
                where: { ho_id: updateId },
                data: {
                  ho_editorId: loginUser.user_id,
                  ho_editorName: loginUser.user_name,
                  ho_editorRank: loginUser.user_rank,
                  ho_isDelete: true,
                  ho_deleteDate: new Date(),
                },
              });
              // 주간 고정 생성
              await prisma.weekOffday.create({
                data: {
                  wo_creatorId: loginUser.user_id,
                  wo_creatorName: loginUser.user_name,
                  wo_creatorRank: loginUser.user_rank,
                  wo_startDate: start,
                  wo_endDate: end,
                  wo_startTime: offStartTime,
                  wo_endTime: offEndTime,
                  wo_memo: memo,
                  hospital: { connect: { hsp_id: user.hospital.hsp_id } },
                },
              });
            }
            if (offdayRepeat === "month") {
              // 임시 휴무 데이터 삭제
              await prisma.hospitalOffday.update({
                where: { ho_id: updateId },
                data: {
                  ho_editorId: loginUser.user_id,
                  ho_editorName: loginUser.user_name,
                  ho_editorRank: loginUser.user_rank,
                  ho_isDelete: true,
                  ho_deleteDate: new Date(),
                },
              });
              // 월간 고정 생성
              await prisma.monthOffday.create({
                data: {
                  fo_creatorId: loginUser.user_id,
                  fo_creatorName: loginUser.user_name,
                  fo_creatorRank: loginUser.user_rank,
                  fo_startDate: start,
                  fo_endDate: end,
                  fo_startTime: offStartTime,
                  fo_endTime: offEndTime,
                  fo_memo: memo,
                  hospital: { connect: { hsp_id: user.hospital.hsp_id } },
                },
              });
            }
            break;
          case "week":
            if (offdayRepeat === "none")
              // 주간 고정 휴무 데이터 삭제
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_isDelete: true,
                  wo_deleteDate: new Date(),
                },
              });
            await prisma.hospitalOffday.create({
              data: {
                ho_creatorId: loginUser.user_id,
                ho_creatorName: loginUser.user_name,
                ho_creatorRank: loginUser.user_rank,
                ho_offStartDate: start,
                ho_offEndDate: end,
                ho_offStartTime: offStartTime,
                ho_offEndTime: offEndTime,
                ho_memo: memo,
                hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              },
            });

            if (offdayRepeat === "week") {
              // 주간 고정 수정
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_startDate: start,
                  wo_endDate: end,
                  wo_startTime: offStartTime,
                  wo_endTime: offEndTime,
                  wo_memo: memo,
                },
              });
            }

            if (offdayRepeat === "month") {
              // 주간 고정 휴무 데이터 삭제
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_isDelete: true,
                  wo_deleteDate: new Date(),
                },
              });
              // 월간 고정 생성
              await prisma.monthOffday.create({
                data: {
                  fo_creatorId: loginUser.user_id,
                  fo_creatorName: loginUser.user_name,
                  fo_creatorRank: loginUser.user_rank,
                  fo_startDate: start,
                  fo_endDate: end,
                  fo_startTime: offStartTime,
                  fo_endTime: offEndTime,
                  fo_memo: memo,
                  hospital: { connect: { hsp_id: user.hospital.hsp_id } },
                },
              });
            }
            break;
          case "month":
            if (offdayRepeat === "none")
              // 월간 고정 휴무 데이터 삭제
              await prisma.monthOffday.update({
                where: { fo_id: updateId },
                data: {
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_isDelete: true,
                  fo_deleteDate: new Date(),
                },
              });
            // 임시 휴무 데이터 생성
            await prisma.hospitalOffday.create({
              data: {
                ho_creatorId: loginUser.user_id,
                ho_creatorName: loginUser.user_name,
                ho_creatorRank: loginUser.user_rank,
                ho_offStartDate: start,
                ho_offEndDate: end,
                ho_offStartTime: offStartTime,
                ho_offEndTime: offEndTime,
                ho_memo: memo,
                hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              },
            });

            if (offdayRepeat === "week") {
              // 월간 고정 휴무 데이터 삭제
              await prisma.monthOffday.update({
                where: { fo_id: updateId },
                data: {
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_isDelete: true,
                  fo_deleteDate: new Date(),
                },
              });
              // 주간 고정 수정
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_startDate: start,
                  wo_endDate: end,
                  wo_startTime: offStartTime,
                  wo_endTime: offEndTime,
                  wo_memo: memo,
                },
              });
            }

            if (offdayRepeat === "month") {
              // 월간 고정 수정
              await prisma.monthOffday.update({
                where: { fo_id: updateId },
                data: {
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_startDate: start,
                  fo_endDate: end,
                  fo_startTime: offStartTime,
                  fo_endTime: offEndTime,
                  fo_memo: memo,
                },
              });
            }
            break;
        }

        return true;
      } catch (e) {
        console.log("병원 쉬는날 수정 실패. updateHospitalOffday", e);
        throw new Error("err_00");
      }
    },
  },
};
