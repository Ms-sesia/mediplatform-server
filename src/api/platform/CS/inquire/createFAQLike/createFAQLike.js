import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createFAQLike: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { faq_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const toggleLike = await prisma.faqLike.findFirst({
          where: { AND: [{ faq_id }, { user_id: user.user_id }] },
        });

        if (!toggleLike) {
          // 없으면 생성
          await prisma.faqLike.create({
            data: {
              fl_like: true,
              faq: { connect: { faq_id } },
              user: { connect: { user_id: user.user_id } },
            },
          });
        } else {
          toggleLike.fl_like
            ? // 좋아요가 눌려있으면(true) false로 업데이트
              await prisma.faqLike.update({
                where: { fl_id: toggleLike.fl_id },
                data: { fl_like: false },
              })
            : // 좋아요가 안눌려있으면(false) true로 업데이트
              await prisma.faqLike.update({
                where: { fl_id: toggleLike.fl_id },
                data: { fl_like: true },
              });
        }

        return true;
      } catch (e) {
        console.log("자주묻는질문 좋아요 등록 실패. createFAQLike", e);
        throw new Error("err_00");
      }
    },
  },
};
