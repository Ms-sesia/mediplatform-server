/*
  Warnings:

  - You are about to drop the column `admin_accountId` on the `admin` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admin_email]` on the table `admin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `admin_admin_accountId_key` ON `admin`;

-- AlterTable
ALTER TABLE `admin` DROP COLUMN `admin_accountId`,
    ADD COLUMN `admin_passwordInit` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `admin_admin_email_key` ON `admin`(`admin_email`);
