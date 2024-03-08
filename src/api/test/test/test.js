import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        // did 진료실
        const exDidDrRooms = await prisma.didDoctorRoom.findMany({
          where: { AND: [{ did: { hsp_id: 3 } }, { ddr_isDelete: false }] },
        });

        // 진료실 코드 기반으로 맵 생성
        const ddrRoomsMap = new Map(exDidDrRooms.map((ddrRoom) => [ddrRoom.ddr_deptCode, ddrRoom]));

        return true;
      } catch (e) {
        console.log("test error =>", e);
        if (e.errorCode === 1) console.log("정확하지 않은 핸드폰번호는 카카오톡 발송이 불가능합니다.", e);
      }
    },
  },
};
