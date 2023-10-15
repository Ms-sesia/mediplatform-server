-- AlterTable
ALTER TABLE `insuranceHistory` ADD COLUMN `ih_detail` VARCHAR(250) NOT NULL DEFAULT '',
    ADD COLUMN `ih_prescription` VARCHAR(250) NOT NULL DEFAULT '',
    ADD COLUMN `ih_receipt` VARCHAR(250) NOT NULL DEFAULT '';
