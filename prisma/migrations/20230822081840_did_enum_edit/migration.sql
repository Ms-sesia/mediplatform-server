/*
  Warnings:

  - You are about to drop the column `admin_loginToken` on the `admin` table. All the data in the column will be lost.
  - The values [patient] on the enum `did_did_mediaType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `admin` DROP COLUMN `admin_loginToken`;

-- AlterTable
ALTER TABLE `did` MODIFY `did_mediaType` ENUM('image', 'video') NOT NULL DEFAULT 'image';
