import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteAdminOneOnOne: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const storagePath = path.join(__dirname, "../../../../../", "files");
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        // const oneAttached = await prisma.oneOnOneAttached.findMany({
        //   where: { oneq_id },
        // });

        // if (oneAttached.length) {
        //   oneAttached.forEach(async (oneAtt) => {
        //     const filename = oneAtt.oneAt_url.split("/")[3];
        //     if (fs.existsSync(`${storagePath}/${filename}`)) {
        //       fs.unlinkSync(`${storagePath}/${filename}`);
        //     }
        //   });
        // }

        // await prisma.oneOnOneAttached.deleteMany({
        //   where: { oneq_id },
        // });

        // await prisma.oneOnOneAnswer.deleteMany({
        //   where: { oneq_id },
        // });

        await prisma.oneOnOne.update({
          where: { oneq_id },
          data: {
            oneq_editorId: loginAdmin.admin_id,
            oneq_editorName: loginAdmin.admin_name,
            oneq_editorRank: loginAdmin.admin_rank,
            oneq_deleteDate: new Date(),
            oneq_isDelete: true,
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 삭제 실패. deleteAdminOneOnOne", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
