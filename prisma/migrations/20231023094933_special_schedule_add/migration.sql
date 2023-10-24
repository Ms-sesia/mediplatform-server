-- AlterTable
ALTER TABLE `specialScheduleHistory` ADD COLUMN `ssh_confirmStatus` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ssh_creatorImg` VARCHAR(250) NOT NULL DEFAULT '',
    ADD COLUMN `ssh_type` VARCHAR(20) NOT NULL DEFAULT '';
