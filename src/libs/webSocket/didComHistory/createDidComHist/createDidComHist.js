import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createDidComHist = async ({ dch_type, dch_didUniqueId, dch_socketId, dch_eventName }) => {
  try {
    await prisma.didCommunicationHistory.create({
      data: {
        dch_type,
        dch_didUniqueId,
        dch_socketId,
        dch_eventName,
      },
    });

    return true;
  } catch (e) {
    console.log("did 요청 히스토리 생성 실패. createDidComHist", e);
    throw new Error("did 요청 히스토리 생성에 실패하였습니다.");
  }
};

export default createDidComHist;
