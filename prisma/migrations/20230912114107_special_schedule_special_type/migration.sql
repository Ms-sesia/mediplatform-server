-- AlterTable
ALTER TABLE `specialSchedule` ADD COLUMN `ss_type` ENUM('offDay', 'schedule') NOT NULL DEFAULT 'offDay';
