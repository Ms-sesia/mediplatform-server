/*
  Warnings:

  - You are about to drop the column `wo_endDay` on the `weekOffday` table. All the data in the column will be lost.
  - You are about to drop the column `wo_startDay` on the `weekOffday` table. All the data in the column will be lost.
  - Changed the type of `fo_endDate` on the `monthOffday` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fo_startDate` on the `monthOffday` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `wo_endDate` to the `weekOffday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wo_startDate` to the `weekOffday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `monthOffday` DROP COLUMN `fo_endDate`,
    ADD COLUMN `fo_endDate` DATETIME(3) NOT NULL,
    DROP COLUMN `fo_startDate`,
    ADD COLUMN `fo_startDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `weekOffday` DROP COLUMN `wo_endDay`,
    DROP COLUMN `wo_startDay`,
    ADD COLUMN `wo_endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `wo_startDate` DATETIME(3) NOT NULL;
