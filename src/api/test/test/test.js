import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        const today9 = new Date(new Date().setHours(new Date().getHours() + 9));

        // const expHsp = await prisma.hospital.updateMany({
        //   where: { hsp_useEndDate: { lt: today9 } },
        //   data: { hsp_useEnded: true },
        // });

        // console.log("expHsp:", expHsp);

        console.log(`${today9.toISOString().split("T")[0]} : 병원 플랫폼 이용 만료일 확인 완료.`);
        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};
