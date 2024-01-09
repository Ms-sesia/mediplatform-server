import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const hpMainCheck = async () => {
  let hmcount = 0;

  hmcount = await prisma.homepageMain.count();

  for (let i = 0; i < 5; i++) {
    if (hmcount < 5) {
      await prisma.homepageMain.create();
      hmcount++;
    }
  }

  const hsd = await prisma.homepageServiceDetail.findFirst();
  if (!hsd) {
    console.log("서비스 상세 생성");
    await prisma.homepageServiceDetail.create({});
  }
};
