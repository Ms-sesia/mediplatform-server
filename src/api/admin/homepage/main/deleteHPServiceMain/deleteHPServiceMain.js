import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHPServiceMain: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsm_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hsm = await prisma.homepageServiceMain.findUnique({ where: { hsm_id } });
        const filename = hsm.hsm_url.split("/")[3];

        if (fs.existsSync(`${storagePath}/${filename}`)) {
          fs.unlinkSync(`${storagePath}/${filename}`);
        }

        await prisma.homepageServiceMain.update({
          where: { hsm_id },
          data: {
            hsm_createdAt: new Date(),
            hsm_url: "",
            hsm_adminName: loginAdmin.admin_name,
            hsm_adminRank: loginAdmin.admin_rank,
            hsm_adminId: loginAdmin.admin_id,
          },
        });

        return true;
      } catch (e) {
        console.log("서비스 메인 삭제 실패. deleteHPServiceMain ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
