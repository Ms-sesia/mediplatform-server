-- CreateTable
CREATE TABLE `monthOffday` (
    `fo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fo_date` INTEGER NOT NULL DEFAULT 0,
    `fo_startTime` VARCHAR(25) NOT NULL DEFAULT '',
    `fo_endTime` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`fo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekOffday` (
    `wo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `wo_day` VARCHAR(25) NOT NULL DEFAULT '',
    `wo_startTime` VARCHAR(25) NOT NULL DEFAULT '',
    `wo_endTime` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`wo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monthOffday` ADD CONSTRAINT `monthOffday_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekOffday` ADD CONSTRAINT `weekOffday_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
