-- AlterTable
ALTER TABLE `hospital` ADD COLUMN `hsp_messageSendNum` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `hsp_messageTrId` VARCHAR(100) NOT NULL DEFAULT '';
