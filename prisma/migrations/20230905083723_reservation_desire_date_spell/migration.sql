/*
  Warnings:

  - You are about to drop the column `re_desiredDate` on the `reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `reservation` DROP COLUMN `re_desiredDate`,
    ADD COLUMN `re_desireDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
