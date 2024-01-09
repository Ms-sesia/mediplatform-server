/*
  Warnings:

  - You are about to drop the column `userUser_id` on the `notiHistory` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `notiHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `notiHistory` DROP FOREIGN KEY `notiHistory_userUser_id_fkey`;

-- AlterTable
ALTER TABLE `notiHistory` DROP COLUMN `userUser_id`,
    ADD COLUMN `ng_check` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `notiHistory` ADD CONSTRAINT `notiHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
