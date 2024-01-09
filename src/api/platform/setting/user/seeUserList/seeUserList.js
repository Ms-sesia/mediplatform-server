import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seeUserList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, filter, take, cursor } = args;
      try {
        const totalUser = await prisma.user.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { user_isDelete: false },
              { user_rank: filter === "" ? undefined : filter },
              { OR: [{ user_name: { contains: searchTerm } }, { user_cellphone: { contains: searchTerm } }] },
            ],
          },
        });

        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        if (!totalUser.length)
          return {
            totalLength: 0,
            userList: [],
          };

        const cursorId = totalUser[cursor].user_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { user_id: cursorId } };

        const findUserList = await prisma.user.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { user_isDelete: false },
              { user_rank: filter === "" ? undefined : filter },
              { OR: [{ user_name: { contains: searchTerm } }, { user_cellphone: { contains: searchTerm } }] },
            ],
          },
          ...cursorOpt,
          orderBy: { user_name: "asc" },
        });

        const userList = findUserList.map(async (userInfo) => {
          const userPermission = await prisma.userPermission.findUnique({ where: { user_id: userInfo.user_id } });
          
          userInfo.user_rankPermission = {
            home: userPermission.up_home,
            reservation: userPermission.up_reservation,
            schedule: userPermission.up_schedule,
            patient: userPermission.up_patient,
            did: userPermission.up_did,
            insurance: userPermission.up_insurance,
            cs: userPermission.up_cs,
            setting: userPermission.up_setting,
          };

          return userInfo;
        });

        return {
          totalLength: totalUser.length ? totalUser.length : 0,
          userList: userList.length ? userList : [],
        };
      } catch (e) {
        console.log("사용자 목록 조회 실패. seeUserList ==>\n", e);
        throw new Error("사용자 목록 조회에 실패하였습니다.");
      }
    },
  },
};
