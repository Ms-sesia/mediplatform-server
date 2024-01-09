import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteServiceContent: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsc_id } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const storagePath = path.join(__dirname, "../../../../../../", "images");

        // 상세 내용 삭제
        await prisma.homepageServiceContentDetail.deleteMany({
          where: { hsc_id },
        });

        // 이미지 삭제 추가 필요
        const hsi = await prisma.homepageServiceImg.findMany({ where: { hsc_id } });
        hsi.forEach(async (img) => {
          const filename = img.hsi_img.split("/")[3];

          if (fs.existsSync(`${storagePath}/${filename}`)) {
            fs.unlinkSync(`${storagePath}/${filename}`);
          }
        });

        await prisma.homepageServiceImg.deleteMany({
          where: { hsc_id },
        });
        // 서비스 내용 삭제
        await prisma.homepageServiceContent.delete({
          where: { hsc_id },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 내용 삭제 실패. deleteServiceContent", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
