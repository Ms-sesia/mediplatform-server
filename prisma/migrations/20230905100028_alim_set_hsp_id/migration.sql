/*
  Warnings:

  - You are about to drop the column `hospitalHsp_id` on the `alimSet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hsp_id]` on the table `alimSet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hsp_id` to the `alimSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `alimSet` DROP FOREIGN KEY `alimSet_hospitalHsp_id_fkey`;

-- AlterTable
ALTER TABLE `alimSet` DROP COLUMN `hospitalHsp_id`,
    ADD COLUMN `hsp_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `alimSet_hsp_id_key` ON `alimSet`(`hsp_id`);

-- AddForeignKey
ALTER TABLE `alimSet` ADD CONSTRAINT `alimSet_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
