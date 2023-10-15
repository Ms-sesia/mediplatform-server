import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeCompanyInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        if (user.userType !== "admin") throw 1;
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        
        const hi = await prisma.homepageIntroduce.findFirst();

        if (!hi)
          return {
            hi_id: 0,
            hi_createdAt: "",
            hi_url: "",
            hi_adminName: "",
            hi_adminRank: "",
            hi_adminId: 0,
          };


        return {
          hi_id: hi.hi_id ? hi.hi_id : 0,
          hi_createdAt: hi.hi_createdAt ? new Date(hi.hi_createdAt).toISOString() : "",
          hi_url: hi.hi_url ? hi.hi_url : "",
          hi_adminName: hi.hi_adminName ? hi.hi_adminName : "",
          hi_adminRank: hi.hi_adminRank ? hi.hi_adminRank : "",
          hi_adminId: hi.hi_adminId ? hi.hi_adminId : 0,
        };
      } catch (e) {
        console.log("관리자 목록 조회 실패. seeHPMain ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
