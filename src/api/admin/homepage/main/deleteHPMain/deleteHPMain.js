import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHPMain: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hm_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hmFile = await prisma.homepageMain.findUnique({ where: { hm_id } });
        const filename = hmFile.hm_url.split("/")[3];

        if (fs.existsSync(`${storagePath}/${filename}`)) {
          fs.unlinkSync(`${storagePath}/${filename}`);
        }

        await prisma.homepageMain.update({
          where: { hm_id },
          data: {
            hm_createdAt: new Date(),
            hm_url: "",
            hm_adminName: loginAdmin.admin_name,
            hm_adminRank: loginAdmin.admin_rank,
            hm_adminId: loginAdmin.admin_id,
          },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 메인 삭제 실패. deleteHPMain", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
