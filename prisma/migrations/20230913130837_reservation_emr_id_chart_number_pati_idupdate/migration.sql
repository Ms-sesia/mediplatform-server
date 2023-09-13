-- DropForeignKey
ALTER TABLE `reservation` DROP FOREIGN KEY `reservation_pati_id_fkey`;

-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `re_chartNumber` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `re_emrId` INTEGER NOT NULL DEFAULT 0,
    MODIFY `pati_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_pati_id_fkey` FOREIGN KEY (`pati_id`) REFERENCES `patient`(`pati_id`) ON DELETE SET NULL ON UPDATE CASCADE;
