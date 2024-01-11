import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 실손보험 데이터 조회
export default async (socket) => {
  socket.on("getInsureData", async (data) => {
    const insureData = JSON.parse(data).data;
    // 요청한 데이터가 있을 경우
    if (insureData.success) {
      console.log("데이터 수신에 성공. unique:", insureData.reqUnique);
      const checkIh = await prisma.insuranceHistory.findFirst({
        where: { ih_tobeUnique: insureData.reqUnique },
        orderBy: { ih_createdAt: "desc" },
      });
    } else {
      console.log("데이터 수신에 실패. unique:", insureData.reqUnique);
      const checkIh = await prisma.insuranceHistory.findFirst({
        where: { ih_tobeUnique: insureData.reqUnique },
        orderBy: { ih_createdAt: "desc" },
      });
    }
  });
};
