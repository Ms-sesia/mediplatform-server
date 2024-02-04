import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        const today = new Date();
        const today9 = new Date(new Date().setHours(new Date().getHours() + 9));

        const end9 = new Date(2024, 2 - 1, 4, 9);

        // console.log("today9:", today9);
        console.log("end9:", end9);

        const hsp = await prisma.hospital.findMany({
          where: { hsp_useEndDate: { lt: end9 } },
          // data: { hsp_useEnded: true },
          select: {
            hsp_name: true,
            hsp_useEndDate: true,
          },
        });

        console.log("hsp:", hsp);

        // console.log(`${today9.toISOString().split("T")[0]} : 병원 플랫폼 이용 만료일 확인 완료.`);

        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};
