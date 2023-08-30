/*
  Warnings:

  - A unique constraint covering the columns `[rank_name]` on the table `rank` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `rank_rank_name_key` ON `rank`(`rank_name`);
