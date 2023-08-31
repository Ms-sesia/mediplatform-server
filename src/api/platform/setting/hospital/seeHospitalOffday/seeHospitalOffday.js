import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, year, month, ho_type, take, cursor } = args;
      try {
        const startDate = new Date(year, month - 1, 1, 9);
        const endDate = new Date(year, month, 1, 9);

        console.log("시작일:", startDate, "종료일:", endDate);

        const searchHospitalOffday = await prisma.hospitalOffday.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              {
                OR: [
                  { ho_offStartDate: { gte: startDate, lte: endDate } }, // 시작일
                  { ho_offEndDate: { gte: startDate, lte: endDate } }, // 종료일
                ],
              },
              { ho_type: ho_type === "total" ? undefined : ho_type },
              { ho_memo: { contains: searchTerm } },
            ],
          },
        });

        console.log(searchHospitalOffday);

        if (!searchHospitalOffday.length)
          return {
            totalLength: 0,
            hospitalOffdayList: [],
          };

        const cursorId = hospitalOffday[cursor].ho_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { ho_id: cursorId } };

        const hospitalOffday = await prisma.hospitalOffday.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              {
                OR: [
                  { ho_offStartDate: { gte: startDate, lte: endDate } }, // 시작일
                  { ho_offEndDate: { gte: startDate, lte: endDate } }, // 종료일
                ],
              },
              { ho_type: ho_type === "total" ? undefined : ho_type },
              { ho_memo: { contains: searchTerm } },
            ],
          },
          ...cursorOpt,
          orderBy: {},
        });

        return {
          // totalLength: totalDid.length ? totalDid.length : 0,
          // didList: didList.length ? didList : [],
        };
      } catch (e) {
        console.log("병원 쉬는날 조회 실패. seeHospitalOffday ==>\n", e);
        throw new Error("병원 쉬는날 조회에 실패하였습니다.");
      }
    },
  },
};
