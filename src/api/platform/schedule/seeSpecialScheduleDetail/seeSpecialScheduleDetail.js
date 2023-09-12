import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeSpecialScheduleDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ss_id } = args;
      try {
        const specialSchedule = await prisma.specialSchedule.findUnique({
          where: { ss_id },
          include: {
            specialScheduleAttactheds: {
              select: {
                sa_id: true,
                sa_url: true,
                sa_fileType: true,
                sa_fileSize: true,
              },
            },
            specialScheduleHistory: {
              where: { ssh_isDelete: false },
              select: {
                ssh_id: true,
                ssh_createdAt: true,
                ssh_creatorName: true,
                ssh_creatorRank: true,
                ssh_creatorId: true,
                ssh_text: true,
              },
            },
          },
        });

        const specialScheduleHistory = specialSchedule.specialScheduleHistory
          ? specialSchedule.specialScheduleHistory.map((ssh) => {
              ssh.ssh_createdAt = new Date(ssh.ssh_createdAt).toISOString();
              return ssh;
            })
          : [];

        const specialScheduleConv = {
          ss_id: specialSchedule.ss_id,
          ss_type: specialSchedule.ss_type,
          ss_doctorRoomName: specialSchedule.ss_doctorRoomName,
          ss_doctorName: specialSchedule.ss_doctorName,
          ss_startDate: new Date(specialSchedule.ss_startDate).toISOString(),
          ss_endDate: new Date(specialSchedule.ss_endDate).toISOString(),
          ss_subDoctorUsed: specialSchedule.ss_subDoctorUsed,
          ss_startTime: specialSchedule.ss_startTime,
          ss_endTime: specialSchedule.ss_endTime,
          ss_memo: specialSchedule.ss_memo,
          ss_status: specialSchedule.ss_status,
          specialScheduleAttactheds: specialSchedule.specialScheduleAttactheds,
          specialScheduleHistory: specialScheduleHistory,
        };

        return specialScheduleConv;
      } catch (e) {
        console.log("특별일정 상세 조회에 실패. seeSpecialScheduleDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
