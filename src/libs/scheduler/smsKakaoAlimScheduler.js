import { PrismaClient } from "@prisma/client";
import schedule from "node-schedule";

const prisma = new PrismaClient();

export default async () => {
  // 초 분 시 일 월 요일(0-7, 0 or 7 is sun)
  // 매일 오전 9시
  schedule.scheduleJob("0 0 9 * * *", async () => {
    const today = new Date();
    const today9 = new Date(new Date().setHours(new Date().getHours() + 9));

    await prisma.hospital.updateMany({
      where: { hsp_useEndDate: { lt: today9 } },
      data: { hsp_useEnded: true },
    });

    console.log(`${today9.toISOString().split("T")[0]} : 병원 플랫폼 이용 만료일 확인 완료.`);
  });
};
