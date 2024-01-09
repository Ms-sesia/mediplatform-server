import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHPCs: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hcs_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hcs = await prisma.homepageCS.findUnique({ where: { hcs_id } });
        const filename = hcs.hcs_url.split("/")[3];

        if (fs.existsSync(`${storagePath}/${filename}`)) {
          fs.unlinkSync(`${storagePath}/${filename}`);
        }

        await prisma.homepageCS.update({
          where: { hcs_id },
          data: {
            hcs_createdAt: new Date(),
            hcs_url: "",
            hcs_adminName: loginAdmin.admin_name,
            hcs_adminRank: loginAdmin.admin_rank,
            hcs_adminId: loginAdmin.admin_id,
          },
        });

        return true;
      } catch (e) {
        console.log("고객지원 삭제 실패. deleteHPCs ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
