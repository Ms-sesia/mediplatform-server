import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDidLowMsg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { did_id, dlm_number, dlm_text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const did = await prisma.did.findUnique({ where: { did_id } });

        await prisma.didLowMsg.create({
          data: {
            dlm_creatorName: loginUser.user_name,
            dlm_creatorRank: loginUser.user_rank,
            dlm_creatorId: loginUser.user_id,
            dlm_number,
            dlm_text,
            did: { connect: { did_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("did 하단 메세지 등록에 실패. createDidLowMsg", e);
        throw new Error("did 하단 메세지 등록에 실패하였습니다.");
      }
    },
  },
};
