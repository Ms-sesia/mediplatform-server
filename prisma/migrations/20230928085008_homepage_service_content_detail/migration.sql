-- AlterTable
ALTER TABLE `homepageServiceContentDetail` ADD COLUMN `hsd_adminId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `hsd_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `hsd_adminRank` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `homepageServiceImg` ADD COLUMN `hsi_imgSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `hsi_imgType` VARCHAR(250) NOT NULL DEFAULT '';
