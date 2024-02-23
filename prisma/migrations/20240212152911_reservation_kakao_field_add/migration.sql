-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `re_proxyReservationYn` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `re_requirement` VARCHAR(650) NOT NULL DEFAULT '',
    ADD COLUMN `re_reservedTreatment` VARCHAR(100) NOT NULL DEFAULT '';
