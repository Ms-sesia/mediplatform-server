-- AlterTable
ALTER TABLE `patient` ADD COLUMN `pati_cellphone2` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `re_doctorRoomId` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `userEmailAuthCode` MODIFY `ueac_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
