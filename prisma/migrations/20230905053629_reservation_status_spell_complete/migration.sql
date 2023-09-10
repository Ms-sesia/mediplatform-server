/*
  Warnings:

  - The values [complet] on the enum `reservation_re_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `reservation` MODIFY `re_status` ENUM('waiting', 'complete', 'confirm', 'cancel') NOT NULL DEFAULT 'waiting';
