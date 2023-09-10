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
                  ho_updatedAt: today9,
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
                  ho_updatedAt: today9,
                  ho_editorId: loginUser.user_id,
                  ho_editorName: loginUser.user_name,
                  ho_editorRank: loginUser.user_rank,
                  ho_isDelete: true,
                  ho_deleteDate: today9,
                },
              });
              // 주간 고정 생성
              await prisma.weekOffday.create({
                data: {
                  wo_createdAt: today9,
                  wo_updatedAt: today9,
                  wo_creatorId: loginUser.user_id,
                  wo_creatorName: loginUser.user_name,
                  wo_creatorRank: loginUser.user_rank,
                  wo_offStartDate: start,
                  wo_offEndDate: end,
                  wo_offStartTime: offStartTime,
                  wo_offEndTime: offEndTime,
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
                  ho_updatedAt: today9,
                  ho_editorId: loginUser.user_id,
                  ho_editorName: loginUser.user_name,
                  ho_editorRank: loginUser.user_rank,
                  ho_isDelete: true,
                  ho_deleteDate: today9,
                },
              });
              // 월간 고정 생성
              await prisma.monthOffday.create({
                data: {
                  mo_createdAt: today9,
                  mo_updatedAt: today9,
                  mo_creatorId: loginUser.user_id,
                  mo_creatorName: loginUser.user_name,
                  mo_creatorRank: loginUser.user_rank,
                  mo_offStartDate: start,
                  mo_offEndDate: end,
                  mo_offStartTime: offStartTime,
                  mo_offEndTime: offEndTime,
                  mo_memo: memo,
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
                  wo_updatedAt: today9,
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_isDelete: true,
                  wo_deleteDate: today9,
                },
              });
            await prisma.hospitalOffday.create({
              data: {
                ho_createdAt: today9,
                ho_updatedAt: today9,
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
                  wo_updatedAt: today9,
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_offStartDate: start,
                  wo_offEndDate: end,
                  wo_offStartTime: offStartTime,
                  wo_offEndTime: offEndTime,
                  wo_memo: memo,
                },
              });
            }

            if (offdayRepeat === "month") {
              // 주간 고정 휴무 데이터 삭제
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_updatedAt: today9,
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_isDelete: true,
                  wo_deleteDate: today9,
                },
              });
              // 월간 고정 생성
              await prisma.monthOffday.create({
                data: {
                  mo_createdAt: today9,
                  mo_updatedAt: today9,
                  mo_creatorId: loginUser.user_id,
                  mo_creatorName: loginUser.user_name,
                  mo_creatorRank: loginUser.user_rank,
                  mo_offStartDate: start,
                  mo_offEndDate: end,
                  mo_offStartTime: offStartTime,
                  mo_offEndTime: offEndTime,
                  mo_memo: memo,
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
                  fo_updatedAt: today9,
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_isDelete: true,
                  fo_deleteDate: today9,
                },
              });
            // 임시 휴무 데이터 생성
            await prisma.hospitalOffday.create({
              data: {
                ho_createdAt: today9,
                ho_updatedAt: today9,
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
                  fo_updatedAt: today9,
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_isDelete: true,
                  fo_deleteDate: today9,
                },
              });
              // 주간 고정 수정
              await prisma.weekOffday.update({
                where: { wo_id: updateId },
                data: {
                  wo_updatedAt: today9,
                  wo_editorId: loginUser.user_id,
                  wo_editorName: loginUser.user_name,
                  wo_editorRank: loginUser.user_rank,
                  wo_offStartDate: start,
                  wo_offEndDate: end,
                  wo_offStartTime: offStartTime,
                  wo_offEndTime: offEndTime,
                  wo_memo: memo,
                },
              });
            }

            if (offdayRepeat === "month") {
              // 월간 고정 수정
              await prisma.monthOffday.update({
                where: { fo_id: updateId },
                data: {
                  fo_updatedAt: today9,
                  fo_editorId: loginUser.user_id,
                  fo_editorName: loginUser.user_name,
                  fo_editorRank: loginUser.user_rank,
                  fo_offStartDate: start,
                  fo_offEndDate: end,
                  fo_offStartTime: offStartTime,
                  fo_offEndTime: offEndTime,
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
