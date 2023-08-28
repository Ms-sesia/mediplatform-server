-- AlterTable
ALTER TABLE `didAttached` ADD COLUMN `da_fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `da_fileType` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `hnAttached` ADD COLUMN `han_fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `han_fileType` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `hospital` ADD COLUMN `hsp_img` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `oneOnOneAttached` ADD COLUMN `oneAt_fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `oneAt_fileType` VARCHAR(50) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `pnAttached` ADD COLUMN `pna_fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pna_fileType` VARCHAR(50) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `hospitalOffday` (
    `ho_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ho_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ho_updatedAt` DATETIME(3) NOT NULL,
    `ho_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ho_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ho_creatorId` INTEGER NOT NULL DEFAULT 0,
    `ho_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ho_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ho_editorId` INTEGER NOT NULL DEFAULT 0,
    `ho_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ho_deleteDate` DATETIME(3) NULL,
    `ho_type` ENUM('temp', 'fix') NOT NULL DEFAULT 'temp',
    `ho_offStartDate` DATETIME(3) NOT NULL,
    `ho_offEndDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ho_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
