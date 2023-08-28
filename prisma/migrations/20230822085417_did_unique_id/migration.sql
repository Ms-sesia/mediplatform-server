/*
  Warnings:

  - A unique constraint covering the columns `[did_uniqueId]` on the table `did` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `did_did_uniqueId_key` ON `did`(`did_uniqueId`);
