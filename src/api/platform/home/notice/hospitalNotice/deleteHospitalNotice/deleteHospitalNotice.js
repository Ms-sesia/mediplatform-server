import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hn_id } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../", "files");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospitalNotice = await prisma.hospitalNotice.findUnique({ where: { hn_id } });

        if (loginUser.user_id !== hospitalNotice.hn_creatorId) throw 1;

        // 댓글 삭제
        await prisma.hnComment.updateMany({
          where: { hn_id },
          data: {
            hnc_editorId: loginUser.user_id,
            hnc_editorName: loginUser.user_name,
            hnc_editorRank: loginUser.user_rank,
            hnc_isDelete: true,
            hnc_deleteDate: new Date(),
          },
        });

        // // 첨부파일 삭제 - 필요?
        // const deleteHnAttached = await prisma.hnAttached.findMany({ where: { hn_id } });

        // deleteHnAttached.map(async (delFile) => {
        //   const urlFileName = delFile.hna_url.split("/")[3];
        //   if (fs.existsSync(`${storagePath}/${urlFileName}`)) {
        //     fs.unlinkSync(`${storagePath}/${urlFileName}`);
        //   }

        //   await prisma.hnAttached.delete({ where: { hna_id: delFile.hna_id } });
        // });

        await prisma.hospitalNotice.update({
          where: { hn_id },
          data: {
            hn_editorId: loginUser.user_id,
            hn_editorName: loginUser.user_name,
            hn_editorRank: loginUser.user_rank,
            hn_isDelete: true,
            hn_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 삭제 실패. deleteHospitalNotice", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};
