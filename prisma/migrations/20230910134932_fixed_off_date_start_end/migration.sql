/*
  Warnings:

  - You are about to drop the column `fo_date` on the `monthOffday` table. All the data in the column will be lost.
  - You are about to drop the column `wo_day` on the `weekOffday` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `monthOffday` DROP COLUMN `fo_date`,
    ADD COLUMN `fo_endDate` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `fo_startDate` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `weekOffday` DROP COLUMN `wo_day`,
    ADD COLUMN `wo_endDay` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `wo_startDay` VARCHAR(25) NOT NULL DEFAULT '';
