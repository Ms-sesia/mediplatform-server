import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 로그인 기록
export const createAdminLoginHistory = async (admin_id, loginInfo) => {
  const { alh_ip, alh_os, alh_browser, alh_status } = loginInfo;
  const admin = await prisma.admin.findUnique({ where: { admin_id: admin_id } });
  try {
    await prisma.adminLoginHistory.create({
      data: {
        alh_ip,
        alh_os,
        alh_browser,
        alh_status,
        admin: { connect: { admin_id } },
      },
    });

    return true;
  } catch (e) {
    console.log(`로그인 기록에 실패하였습니다. 실패 계정: ${admin.admin_accountId} ==>\n`, e);
    throw new Error("로그인 기록 실패");
    // return false;
  }
};
