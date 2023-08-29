/*
  Warnings:

  - Added the required column `hsp_id` to the `medicalSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hsp_id` to the `org` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hsp_id` to the `rank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `medicalSubject` ADD COLUMN `hsp_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `org` ADD COLUMN `hsp_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `rank` ADD COLUMN `hsp_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `org` ADD CONSTRAINT `org_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rank` ADD CONSTRAINT `rank_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medicalSubject` ADD CONSTRAINT `medicalSubject_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
