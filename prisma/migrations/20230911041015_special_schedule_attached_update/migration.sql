-- AlterTable
ALTER TABLE `specialScheduleAttacthed` ADD COLUMN `sa_fileSize` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `sa_fileType` VARCHAR(50) NOT NULL DEFAULT '';
