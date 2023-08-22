-- AlterTable
ALTER TABLE `admin` ADD COLUMN `admin_doLoginCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `admin_loginFailTime` VARCHAR(191) NOT NULL DEFAULT '';
