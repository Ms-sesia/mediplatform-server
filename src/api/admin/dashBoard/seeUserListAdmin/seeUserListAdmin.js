import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeUserListAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, orderBy, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const totalUsers = await prisma.user.findMany({
          where: { user_name: { contains: searchTerm } },
          select: {
            user_id: true,
            user_createdAt: true,
            user_name: true,
            user_birthday: true,
            user_cellphone: true,
            user_email: true,
            user_rank: true,
            user_job: true,
            user_isDelete: true,
            user_deleteDate: true,
            hospital: { select: { hsp_name: true } },
          },
          orderBy: { user_name: orderBy === "desc" ? "desc" : "asc" },
        });

        if (!totalUsers.length)
          return {
            totalLength: 0,
            userInfoList: [],
          };

        const cursorId = totalUsers[cursor].user_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { user_id: cursorId } };

        const userList = await prisma.user.findMany({
          where: { user_name: { contains: searchTerm } },
          select: {
            user_id: true,
            user_createdAt: true,
            user_name: true,
            user_birthday: true,
            user_cellphone: true,
            user_email: true,
            user_rank: true,
            user_job: true,
            user_isDelete: true,
            user_deleteDate: true,
            hospital: { select: { hsp_name: true } },
          },
          orderBy: { user_name: orderBy === "desc" ? "desc" : "asc" },
          ...cursorOpt,
        });

        const userInfos = userList.map((userInfo) => {
          userInfo.user_createdAt = userInfo.user_createdAt ? new Date(userInfo.user_createdAt).toISOString() : "";
          userInfo.user_deleteDate = userInfo.user_deleteDate ? new Date(userInfo.user_deleteDate).toISOString() : "";
          userInfo.user_birthday = userInfo.user_birthday ? userInfo.user_birthday.split("T")[0] : "";
          userInfo.hsp_name = userInfo.hospital.hsp_name ? userInfo.hospital.hsp_name : "";
          return userInfo;
        });

        return {
          totalLength: totalUsers.length ? totalUsers.length : 0,
          userInfoList: userInfos.length ? userInfos : [],
        };
      } catch (e) {
        console.log("사용자 목록 조회(관리자) 실패. seeUserListAdmin", e);
        if (e === 1) throw new Error("err_01"); // 관리자만 이용 가능합니다.
        throw new Error("err_00"); // 사용자 목록 조회에 실패하였습니다.
      }
    },
  },
};
