import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateServiceContent: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsc_id, title, textList } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hsc = await prisma.homepageServiceContent.findUnique({ where: { hsc_id } });

        if (!hsc) throw 2;

        // 상세 내용 삭제
        await prisma.homepageServiceContentDetail.deleteMany({
          where: { hsc_id },
        });

        if (textList.length) {
          textList.forEach(async (text) => {
            await prisma.homepageServiceContentDetail.create({
              data: {
                hsd_text: text,
                hsd_adminName: admin.admin_name,
                hsd_adminRank: admin.admin_rank,
                hsd_adminId: admin.admin_id,
                homepageServiceContent: { connect: { hsc_id } },
              },
            });
          });
        }

        await prisma.homepageServiceContent.update({
          where: { hsc_id },
          data: { hsc_title: title },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 내용 수정. updateServiceContent", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02"); //서비스 내용이 없음.
        throw new Error("err_00");
      }
    },
  },
};
