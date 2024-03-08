import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDefaultSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

        const scheduleList = await prisma.defaultSchedule.findMany({
          where: { AND: [{ ds_isDelete: false }, { hsp_id: user.hospital.hsp_id }] },
        });

        const sortedDays = scheduleList.sort((a, b) => order.indexOf(a.ds_day) - order.indexOf(b.ds_day));

        return {
          totalLength: scheduleList.length ? scheduleList.length : 0,
          defaultScheduleList: sortedDays.length ? sortedDays : [],
        };
      } catch (e) {
        console.log("기본 설정 스케쥴 조회 실패. seeDefaultSchedule ==>\n", e);
        throw new Error("기본 설정 스케쥴 조회에 실패하였습니다.");
      }
    },
  },
};

// 개발 다시 필요
