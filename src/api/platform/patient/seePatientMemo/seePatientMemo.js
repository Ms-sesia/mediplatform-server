import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seePatientMemo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_id } = args;
      try {
        const patientMemo = await prisma.patientMemo.findMany({
          where: { AND: [{ pati_id }, { prm_isDelete: false }] },
          orderBy: { prm_createdAt: "desc" },
        });

        if (!patientMemo.length) return [];

        const memoList = patientMemo.map((memo) => {
          memo.prm_createdAt = new Date(memo.prm_createdAt).toISOString();
          return memo;
        });

        return patientMemo.length ? memoList : [];
      } catch (e) {
        console.log("환자 메모 조회 실패. seePatientMemo ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
