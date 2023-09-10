/*
  Warnings:

  - You are about to drop the column `dr_didOffDay` on the `doctorRoom` table. All the data in the column will be lost.
  - You are about to drop the column `re_medicalRoom` on the `reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `doctorRoom` DROP COLUMN `dr_didOffDay`,
    ADD COLUMN `dr_medicalSub` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `reservation` DROP COLUMN `re_medicalRoom`,
    ADD COLUMN `re_doctorRoomName` VARCHAR(25) NOT NULL DEFAULT '';
