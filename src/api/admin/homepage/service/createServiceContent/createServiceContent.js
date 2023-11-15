import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createServiceContent: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { serviceType, detailTabName, title, textList } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const checkHsc = await prisma.homepageServiceContent.findMany({
          where: {
            AND: [
              { hsc_serviceType: serviceType },
              { hsc_detailTabName: detailTabName },
              { hsc_title: { contains: title } },
            ],
          },
        });

        // 이미 생성된 타이틀의 내용이 있으면 수정만 가능
        if (checkHsc.length) throw 2;

        const hsc = await prisma.homepageServiceContent.create({
          data: {
            hsc_createdAt: new Date(),
            hsc_serviceType: serviceType,
            hsc_detailTabName: detailTabName,
            hsc_title: title,
            hsc_adminName: admin.admin_name,
            hsc_adminRank: admin.admin_rank,
            hsc_adminId: admin.admin_id,
          },
        });

        if (textList.length) {
          textList.forEach(async (txt) => {
            await prisma.homepageServiceContentDetail.create({
              data: {
                hsd_text: txt,
                hsd_adminName: admin.admin_name,
                hsd_adminRank: admin.admin_rank,
                hsd_adminId: admin.admin_id,
                homepageServiceContent: { connect: { hsc_id: hsc.hsc_id } },
              },
            });
          });
        }

        return true;
      } catch (e) {
        console.log("홈페이지 서비스 내용 추가(emr 차트 / cloud 플랫폼) 실패. createServiceContent", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02"); // 서비스 타입의 타이틀 이미 생성되어있음. 수정만 가능
        throw new Error("err_00");
      }
    },
  },
};
