import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeOrg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsp_id } = args;
      try {
        const orgList = await prisma.org.findMany({
          where: { AND: [{ org_isDelete: false }, { hsp_id }] },
          orderBy: { org_name: "asc" },
        });

        if (!orgList.length)
          return {
            totalLength: 0,
            orgList: [],
          };

        return {
          totalLength: orgList.length ? orgList.length : 0,
          orgList: orgList.length ? orgList : [],
        };
      } catch (e) {
        console.log("조직 조회 실패. seeOrg ==>\n", e);
        throw new Error("조직 조회에 실패하였습니다.");
      }
    },
  },
};
