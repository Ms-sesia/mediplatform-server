/*
  Warnings:

  - You are about to drop the column `user_permission` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `rank_rank_name_key` ON `rank`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `user_permission`;
