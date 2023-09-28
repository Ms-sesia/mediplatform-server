import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deletePlatformNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const platformNotice = await prisma.platformNotice.update({
          where: { pn_id },
          data: {
            pn_updatedAt: today9,
            pn_adminEditorId: loginAdmin.admin_id,
            pn_adminEditorName: loginAdmin.admin_name,
            pn_adminEditorRank: loginAdmin.admin_rank,
            pn_isDelete: true,
            pn_deleteDate: today9,
          },
        });

        const pncList = await prisma.pnComment.findMany({
          where: { pn_id },
        });

        pncList.forEach(async (pnc) => {
          await prisma.pnComment.update({
            where: { pnc_id: pnc.pnc_id },
            data: {
              pnc_isDelete: true,
              pnc_deleteDate: today9,
              pnc_editorId: loginAdmin.admin_id,
              pnc_editorName: loginAdmin.admin_name,
              pnc_editorRank: loginAdmin.admin_rank,
            },
          });
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 삭제 실패. deletePlatformNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
