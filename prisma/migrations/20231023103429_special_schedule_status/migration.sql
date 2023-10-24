/*
  Warnings:

  - You are about to alter the column `ssh_confirmStatus` on the `specialScheduleHistory` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(12))`.

*/
-- AlterTable
ALTER TABLE `specialScheduleHistory` MODIFY `ssh_confirmStatus` ENUM('notSign', 'sign', 'reject') NOT NULL DEFAULT 'notSign';
