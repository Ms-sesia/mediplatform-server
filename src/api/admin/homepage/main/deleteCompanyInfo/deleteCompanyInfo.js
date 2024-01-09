import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteCompanyInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hi_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hi = await prisma.homepageIntroduce.findUnique({ where: { hi_id } });
        const filename = hi.hi_url.split("/")[3];

        if (fs.existsSync(`${storagePath}/${filename}`)) {
          fs.unlinkSync(`${storagePath}/${filename}`);
        }

        await prisma.homepageIntroduce.update({
          where: { hi_id },
          data: {
            hi_createdAt: new Date(),
            hi_url: "",
            hi_adminName: loginAdmin.admin_name,
            hi_adminRank: loginAdmin.admin_rank,
            hi_adminId: loginAdmin.admin_id,
          },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 회사소개 삭제 실패. deleteCompanyInfo ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
