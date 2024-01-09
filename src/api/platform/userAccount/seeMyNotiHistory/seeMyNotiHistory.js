import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeMyNotiHistory: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      let notiHistories = new Array();
      try {
        const myNotiList = await prisma.notiHistory.findMany({
          where: { AND: [{ ng_check: false }, { user: { user_id: user.user_id } }] },
        });

        notiHistories = myNotiList.map((noti) => {
          return {
            ng_id: noti.ng_id,
            text: noti.ng_text,
            check: noti.ng_check,
          };
        });

        return notiHistories.length ? notiHistories : [];
      } catch (e) {
        console.log("사용자 알림 내역 조회 실패. seeMyNotiHistory ==>\n", e);
        throw new Error("사용자 알림내역 조회에 실패하였습니다.");
      } finally {
        if (notiHistories.length) {
          notiHistories.forEach(async (hstry) => {
            console.log("hstry:", hstry);
            await prisma.notiHistory.update({
              where: { ng_id: hstry.ng_id },
              data: { ng_check: true },
            });
          });
        }
      }
    },
  },
};
