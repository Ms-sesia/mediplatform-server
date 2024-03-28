import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDidMonitors: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, filter, take, cursor } = args;
      try {
        const totalDid = await prisma.did.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { did_title: { contains: searchTerm } },
              { did_mediaType: filter === "total" ? undefined : filter },
              { did_isDelete: false },
            ],
          },
          orderBy: { did_createdAt: "desc" },
        });

        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        if (!totalDid.length)
          return {
            totalLength: 0,
            didList: [],
          };

        const cursorId = totalDid[cursor].did_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { did_id: cursorId } };

        const didList = await prisma.did.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { did_title: { contains: searchTerm } },
              { did_mediaType: filter === "total" ? undefined : filter },
              { did_isDelete: false },
            ],
          },
          include: {
            didAttached: {
              where: { da_isDelete: false },
              orderBy: { da_number: "asc" },
            },
            didLowMsg: {
              where: { dlm_isDelete: false },
              orderBy: { dlm_number: "asc" },
            },
            didDoctorRoom: {
              where: { ddr_isDelete: false },
              orderBy: { ddr_number: "asc" },
            },
          },
          ...cursorOpt,
          orderBy: { did_createdAt: "desc" },
        });

        return {
          totalLength: totalDid.length ? totalDid.length : 0,
          didList: didList.length ? didList : [],
        };
      } catch (e) {
        console.log("did 목록 조회 실패. seeDidMonitors ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};
