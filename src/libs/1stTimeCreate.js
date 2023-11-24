import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const hpMainCheck = async () => {
  let hmcount = 0;

  hmcount = await prisma.homepageMain.count();

  for (let i = 0; i < 3; i++) {
    if (hmcount < 3) {
      await prisma.homepageMain.create();
      hmcount++;
    }
  }
};
