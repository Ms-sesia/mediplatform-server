import { PrismaClient } from "@prisma/client";

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
              { rank: filter === "" ? undefined : filter },
              { user_name: { contains: searchTerm } },
              { user_cellphone: { contains: searchTerm } },
            ],
          },
        });

        if (!totalUser.length)
          return {
            totalLength: 0,
            userList: [],
          };

        const cursorId = totalUser[cursor].user_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { user_id: cursorId } };

        const userList = await prisma.user.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { user_isDelete: false },
              { rank: filter === "" ? undefined : filter },
              { user_name: { contains: searchTerm } },
              { user_cellphone: { contains: searchTerm } },
            ],
          },
          // include: {
          //   didAttached: {
          //     where: { da_isDelete: false },
          //     orderBy: { da_number: "asc" },
          //   },
          //   didLowMsg: {
          //     where: { dlm_isDelete: false },
          //     orderBy: { dlm_number: "asc" },
          //   },
          //   didDoctorRoom: {
          //     where: { ddr_isDelete: false },
          //     orderBy: { ddr_number: "asc" },
          //   },
          // },
          ...cursorOpt,
          orderBy: { user_name: "asc" },
        });

        return {
          totalLength: totalUser.length ? totalUser.length : 0,
          userList: userList.length ? userList : [],
        };
      } catch (e) {
        console.log("관리자 목록 조회 실패. seeDidMonitors ==>\n", e);
        throw new Error("관리자 목록 조회에 실패하였습니다.");
      }
    },
  },
};
