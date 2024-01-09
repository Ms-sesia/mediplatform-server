/*
  Warnings:

  - You are about to drop the column `hsc_id` on the `homepageServiceImg` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `homepageServiceImg` DROP FOREIGN KEY `homepageServiceImg_hsc_id_fkey`;

-- AlterTable
ALTER TABLE `homepageServiceImg` DROP COLUMN `hsc_id`,
    ADD COLUMN `hsi_detailTabName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `hsi_serviceType` VARCHAR(25) NOT NULL DEFAULT '';
