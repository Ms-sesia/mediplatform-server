import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createOrg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { org_name } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const findOrg = await prisma.org.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { org_name: { contains: org_name } }] },
        });

        if (findOrg.length) throw 1;

        await prisma.org.create({
          data: {
            org_creatorId: loginUser.user_id,
            org_creatorName: loginUser.user_name,
            org_creatorRank: loginUser.user_rank,
            org_name,
            hospital: { connect: { hsp_id: loginUser.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("조직 등록 실패. createOrg", e);
        if (e === 1) throw new Error("err_01"); // 이미 등록된 이름입니다.
        // throw new Error("조직 등록에 실패하였습니다.");
        throw new Error("err_00");
      }
    },
  },
};
