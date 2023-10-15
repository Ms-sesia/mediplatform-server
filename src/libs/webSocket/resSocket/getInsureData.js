import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 실손보험 데이터 조회
export default async (socket) => {
  socket.on("getInsureData", async (data) => {
    const insureData = JSON.parse(data).data;
    insureData.map(async (insData) => {
      // 요청한 데이터가 있을 경우
      if (insData.success) {
        console.log("데이터 수신에 성공. unique:", insData.reqUnique);
        const checkIh = await prisma.insuranceHistory.findFirst({
          where: { ih_tobeUnique: insData.reqUnique },
          orderBy: { ih_createdAt: "desc" },
        });

        await prisma.ihText.create({
          data: {
            iht_text: `EMR -> 플랫폼 데이터 수신에 성공했습니다.`,
            insuranceHistory: { connect: { ih_id: checkIh.ih_id } },
          },
        });
        // 없을 경우
      } else {
        console.log("데이터 수신에 실패. unique:", insData.reqUnique);
        const checkIh = await prisma.insuranceHistory.findFirst({
          where: { ih_tobeUnique: insData.reqUnique },
          orderBy: { ih_createdAt: "desc" },
        });
        await prisma.ihText.create({
          data: {
            iht_text: `EMR -> 플랫폼 데이터 수신에 실패했습니다.`,
            insuranceHistory: { connect: { ih_id: checkIh.ih_id } },
          },
        });

        await prisma.insuranceHistory.update({
          where: { ih_id: checkIh.ih_id },
          data: { ih_status: "fail" },
        });
      }
    });
  });
};
// {
//   "type": "receipt",
//   "data": [
//     {
//       "reqUnique" : "BFCAD3B4-1675-4C09-A4DE-CBD0DB7B90B6",
//       "success" : "true",
//       "yKiho": "0 : test yKiho",
//       "businessNo": "0 : test businessNo",
//       ...
//       "insuranceCode": "0 : test insuranceCode",
//       "NightHolidayType": "0 : test NightHolidayType"
//     },
//     {
//       "reqUnique" : "17D82E23-A568-475E-9673-ED3F32585541",
//       "success" : "false",
//       "yKiho": "1 : test yKiho",
//       "businessNo": "1 : test businessNo",
//       ...
//       "insuranceCode": "1 : test insuranceCode",
//       "NightHolidayType": "1 : test NightHolidayType"
//     }
//   ]
// }
