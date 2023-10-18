import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (searchTerm, user_id) => {
  try {
    const searchHistory = await prisma.searchHistory.findMany({
      where: { user_id },
      select: { sh_text: true },
      take: 10,
      orderBy: { sh_createdAt: "desc" },
    });

    const searchText = searchHistory.map((search) => search.sh_text);
    if (searchTerm && !searchText.includes(searchTerm)) {
      await prisma.searchHistory.create({
        data: {
          sh_text: searchTerm,
          user: { connect: { user_id } },
        },
      });

      return {
        status: true,
        message: "검색 기록 생성 성공",
        error: "",
      };
    }
    return {
      status: true,
      message: "검색 기록 존재. 생성 안함.",
      error: "",
    };
  } catch (e) {
    console.log("검색 기록(searchHistory) 생성 실패.", e);
    return {
      status: false,
      message: "검색 기록 생성 실패",
      error: e,
    };
  }
};
