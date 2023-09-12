import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeSpecialSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, month, searchTerm, orderBy } = args;
      try {
        const startDate = new Date(year, month - 1, 1, 9);
        const endDate = new Date(year, month, 1, 9);
        const searchHistory = await prisma.searchHistory.findMany({
          where: { user_id: user.user_id },
          select: { sh_text: true },
          take: 10,
          orderBy: { sh_createdAt: "desc" },
        });

        const searchText = searchHistory.map((search) => search.sh_text);
        if (searchTerm && !searchText.includes(searchTerm)) {
          await prisma.searchHistory.create({
            data: {
              sh_text: searchTerm,
              user: { connect: { user_id: user.user_id } },
            },
          });
        }

        // 진료실
        const drSSList = await prisma.doctorRoom.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { dr_isDelete: false }, { dr_roomName: { contains: searchTerm } }],
          },
          include: {
            specialSchedule: {
              where: {
                AND: [
                  {
                    OR: [
                      { ss_startDate: { gte: startDate, lte: endDate } },
                      { ss_endDate: { gte: startDate, lte: endDate } },
                    ],
                  },
                  { ss_isDelete: false },
                ],
              },
              select: {
                ss_id: true,
                ss_type: true,
                ss_doctorRoomName: true,
                ss_doctorName: true,
                ss_startDate: true,
                ss_endDate: true,
                ss_subDoctorUsed: true,
                ss_startTime: true,
                ss_endTime: true,
                ss_memo: true,
                ss_status: true,
              },
            },
          },
          orderBy: { dr_roomName: orderBy },
        });

        if (!drSSList.length) return [];

        const ssInfo = new Array();

        for (let i = 0; i < drSSList.length; i++) {
          for (let j = 0; j < drSSList[i].specialSchedule.length; j++) {
            ssInfo.push(drSSList[i].specialSchedule[j]);
          }
        }

        return ssInfo.length ? ssInfo : [];
      } catch (e) {
        console.log("월별 특별일정 목록 조회 실패. seeSpecialSchedule ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
