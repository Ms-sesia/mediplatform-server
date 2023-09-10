/*
  Warnings:

  - The primary key for the `alimSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `upas_id` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_templateId` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_time1` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_time2` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_time3` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_time4` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_type` on the `alimSet` table. All the data in the column will be lost.
  - You are about to drop the column `upas_updatedAt` on the `alimSet` table. All the data in the column will be lost.
  - Added the required column `as_id` to the `alimSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `as_updatedAt` to the `alimSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alimSet` DROP PRIMARY KEY,
    DROP COLUMN `upas_id`,
    DROP COLUMN `upas_templateId`,
    DROP COLUMN `upas_time1`,
    DROP COLUMN `upas_time2`,
    DROP COLUMN `upas_time3`,
    DROP COLUMN `upas_time4`,
    DROP COLUMN `upas_type`,
    DROP COLUMN `upas_updatedAt`,
    ADD COLUMN `as_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `as_templateId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `as_time1` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `as_time2` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `as_time3` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `as_time4` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `as_type` ENUM('sms', 'kakao') NOT NULL DEFAULT 'sms',
    ADD COLUMN `as_updatedAt` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`as_id`);
