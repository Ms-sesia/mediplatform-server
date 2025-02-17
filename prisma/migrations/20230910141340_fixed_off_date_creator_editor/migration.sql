-- AlterTable
ALTER TABLE `monthOffday` ADD COLUMN `fo_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `fo_creatorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `fo_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `fo_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `fo_deleteDate` DATETIME(3) NULL,
    ADD COLUMN `fo_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `fo_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `fo_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `fo_isDelete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `fo_updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `weekOffday` ADD COLUMN `wo_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `wo_creatorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `wo_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `wo_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `wo_deleteDate` DATETIME(3) NULL,
    ADD COLUMN `wo_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `wo_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `wo_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `wo_isDelete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `wo_updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
