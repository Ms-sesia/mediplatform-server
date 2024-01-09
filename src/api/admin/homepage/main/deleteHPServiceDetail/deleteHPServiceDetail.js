import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHPServiceDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsd_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hsd = await prisma.homepageServiceDetail.findUnique({ where: { hsd_id } });
        const filename = hsd.hsd_url.split("/")[3];

        if (fs.existsSync(`${storagePath}/${filename}`)) {
          fs.unlinkSync(`${storagePath}/${filename}`);
        }

        await prisma.homepageServiceDetail.update({
          where: { hsd_id },
          data: {
            hsd_createdAt: new Date(),
            hsd_url: "",
            hsd_adminName: loginAdmin.admin_name,
            hsd_adminRank: loginAdmin.admin_rank,
            hsd_adminId: loginAdmin.admin_id,
          },
        });

        return true;
      } catch (e) {
        console.log("서비스 상세 삭제 실패. deleteHPServiceDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
