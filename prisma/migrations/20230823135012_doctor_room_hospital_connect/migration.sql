/*
  Warnings:

  - You are about to drop the column `ddr_id` on the `specialSchedule` table. All the data in the column will be lost.
  - You are about to drop the `didDoctorRoom` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hsp_id` to the `doctorRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `didDoctorRoom` DROP FOREIGN KEY `didDoctorRoom_did_id_fkey`;

-- DropForeignKey
ALTER TABLE `specialSchedule` DROP FOREIGN KEY `specialSchedule_ddr_id_fkey`;

-- DropForeignKey
ALTER TABLE `specialSchedule` DROP FOREIGN KEY `specialSchedule_hsp_id_fkey`;

-- AlterTable
ALTER TABLE `doctorRoom` ADD COLUMN `dr_didOffDay` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hsp_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `specialSchedule` DROP COLUMN `ddr_id`,
    MODIFY `hsp_id` INTEGER NULL;

-- DropTable
DROP TABLE `didDoctorRoom`;

-- AddForeignKey
ALTER TABLE `specialSchedule` ADD CONSTRAINT `specialSchedule_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctorRoom` ADD CONSTRAINT `doctorRoom_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
