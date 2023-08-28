/*
  Warnings:

  - You are about to drop the column `dr_doctorRoomCode` on the `doctorRoom` table. All the data in the column will be lost.
  - You are about to drop the column `ul_adminName` on the `userUpdateLog` table. All the data in the column will be lost.
  - You are about to drop the column `ul_adminTeam` on the `userUpdateLog` table. All the data in the column will be lost.
  - You are about to drop the column `ul_employeeNumber` on the `userUpdateLog` table. All the data in the column will be lost.
  - Added the required column `hsp_id` to the `hospitalOffday` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `didDoctorRoom` ADD COLUMN `ddr_deptCode` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `doctorRoom` DROP COLUMN `dr_doctorRoomCode`,
    ADD COLUMN `dr_deptCode` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `hospitalOffday` ADD COLUMN `ho_memo` VARCHAR(250) NOT NULL DEFAULT '',
    ADD COLUMN `ho_offEndTime` VARCHAR(15) NOT NULL DEFAULT '',
    ADD COLUMN `ho_offStartTime` VARCHAR(15) NOT NULL DEFAULT '',
    ADD COLUMN `ho_offdayRepeat` ENUM('none', 'week', 'month') NOT NULL DEFAULT 'none',
    ADD COLUMN `hsp_id` INTEGER NOT NULL,
    MODIFY `ho_offEndDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `user_address` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `user_detailAddress` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `userUpdateLog` DROP COLUMN `ul_adminName`,
    DROP COLUMN `ul_adminTeam`,
    DROP COLUMN `ul_employeeNumber`,
    ADD COLUMN `ul_name` VARCHAR(20) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `org` (
    `org_id` INTEGER NOT NULL AUTO_INCREMENT,
    `org_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `org_updatedAt` DATETIME(3) NOT NULL,
    `org_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `org_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `org_creatorId` INTEGER NOT NULL DEFAULT 0,
    `org_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `org_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `org_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `org_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `org_deleteDate` DATETIME(3) NULL,
    `org_name` VARCHAR(25) NOT NULL DEFAULT '',

    PRIMARY KEY (`org_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rank` (
    `rank_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rank_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rank_updatedAt` DATETIME(3) NOT NULL,
    `rank_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `rank_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `rank_creatorId` INTEGER NOT NULL DEFAULT 0,
    `rank_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `rank_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `rank_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `rank_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `rank_deleteDate` DATETIME(3) NULL,
    `rank_name` VARCHAR(25) NOT NULL DEFAULT '',

    PRIMARY KEY (`rank_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicalSubject` (
    `ms_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ms_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ms_updatedAt` DATETIME(3) NOT NULL,
    `ms_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `ms_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `ms_creatorId` INTEGER NOT NULL DEFAULT 0,
    `ms_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ms_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ms_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `ms_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ms_deleteDate` DATETIME(3) NULL,
    `ms_name` VARCHAR(25) NOT NULL DEFAULT '',

    PRIMARY KEY (`ms_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medicalSubjectDetail` (
    `msd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `msd_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `msd_updatedAt` DATETIME(3) NOT NULL,
    `msd_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `msd_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `msd_creatorId` INTEGER NOT NULL DEFAULT 0,
    `msd_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `msd_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `msd_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `msd_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `msd_deleteDate` DATETIME(3) NULL,
    `msd_name` VARCHAR(25) NOT NULL DEFAULT '',
    `ms_id` INTEGER NOT NULL,

    PRIMARY KEY (`msd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hospitalOffday` ADD CONSTRAINT `hospitalOffday_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicalSubjectDetail` ADD CONSTRAINT `medicalSubjectDetail_ms_id_fkey` FOREIGN KEY (`ms_id`) REFERENCES `medicalSubject`(`ms_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
