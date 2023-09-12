/*
  Warnings:

  - You are about to drop the column `ss_dayoff` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_endMonth` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_endYear` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_roomType` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_startMonth` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_startYear` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `ss_subUsed` on the `specialSchedule` table. All the data in the column will be lost.
  - The `ss_startDate` column on the `specialSchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ss_endDate` column on the `specialSchedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `specialSchedule` DROP COLUMN `ss_dayoff`,
    DROP COLUMN `ss_endMonth`,
    DROP COLUMN `ss_endYear`,
    DROP COLUMN `ss_roomType`,
    DROP COLUMN `ss_startMonth`,
    DROP COLUMN `ss_startYear`,
    DROP COLUMN `ss_subUsed`,
    ADD COLUMN `ss_doctorRoomName` VARCHAR(35) NOT NULL DEFAULT '',
    ADD COLUMN `ss_subDoctorUsed` BOOLEAN NOT NULL DEFAULT false,
    DROP COLUMN `ss_startDate`,
    ADD COLUMN `ss_startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `ss_endDate`,
    ADD COLUMN `ss_endDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
