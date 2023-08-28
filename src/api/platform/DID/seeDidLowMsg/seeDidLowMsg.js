import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDidLowMsg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { did_id } = args;
      try {
        const didLowMsg = await prisma.didLowMsg.findMany({
          where: { AND: [{ did_id }, { dlm_isDelete: false }] },
        });

        return {
          totalLength: didLowMsg.length ? didLowMsg.length : 0,
          didLowMsgList: didLowMsg.length ? didLowMsg : [],
        };
      } catch (e) {
        console.log("did 하단 메세지 목록 조회 실패. seeDidLowMsg ==>\n", e);
        throw new Error("did 하단 메세지 목록 조회에 실패하였습니다.");
      }
    },
  },
};
