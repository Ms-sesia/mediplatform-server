-- AlterTable
ALTER TABLE `insuranceHistory` ADD COLUMN `ih_tobeClaimDate` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `ih_tobeDate` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `ih_tobePatno` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `ih_tobeUnique` VARCHAR(50) NOT NULL DEFAULT '';
