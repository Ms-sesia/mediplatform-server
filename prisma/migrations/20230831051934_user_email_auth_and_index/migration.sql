/*
  Warnings:

  - You are about to drop the column `user_withdrwal` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `user_withdrwal`;

-- CreateTable
CREATE TABLE `userEmailAuthCode` (
    `ueac_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ueac_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ueac_code` VARCHAR(10) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`ueac_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `hospitalOffday_hsp_id_ho_offStartDate_ho_offEndDate_idx` ON `hospitalOffday`(`hsp_id`, `ho_offStartDate`, `ho_offEndDate`);

-- CreateIndex
CREATE INDEX `user_user_name_user_cellphone_idx` ON `user`(`user_name`, `user_cellphone`);

-- AddForeignKey
ALTER TABLE `userEmailAuthCode` ADD CONSTRAINT `userEmailAuthCode_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
