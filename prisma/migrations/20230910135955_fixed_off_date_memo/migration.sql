-- AlterTable
ALTER TABLE `monthOffday` ADD COLUMN `fo_memo` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `weekOffday` ADD COLUMN `wo_memo` VARCHAR(250) NOT NULL DEFAULT '';
