import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteServiceImg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsi_id } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const storagePath = path.join(__dirname, "../../../../../../", "images");

        const hsci = await prisma.homepageServiceImg.findUnique({ where: { hsi_id } });

        const filename = hsci.hsi_img.split("/")[3];

        if (filename) {
          if (fs.existsSync(`${storagePath}/${filename}`)) {
            fs.unlinkSync(`${storagePath}/${filename}`);
          }
        }

        await prisma.homepageServiceImg.delete({
          where: { hsi_id },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 이미지 삭제 실패. deleteServiceImg ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
