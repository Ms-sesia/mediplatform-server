/*
  Warnings:

  - You are about to drop the column `rp_cs` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_did` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_home` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_insurance` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_patient` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_reservation` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_schedule` on the `userPermission` table. All the data in the column will be lost.
  - You are about to drop the column `rp_setting` on the `userPermission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `userPermission` DROP COLUMN `rp_cs`,
    DROP COLUMN `rp_did`,
    DROP COLUMN `rp_home`,
    DROP COLUMN `rp_insurance`,
    DROP COLUMN `rp_patient`,
    DROP COLUMN `rp_reservation`,
    DROP COLUMN `rp_schedule`,
    DROP COLUMN `rp_setting`,
    ADD COLUMN `up_cs` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_did` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_home` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `up_insurance` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_patient` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_reservation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_schedule` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `up_setting` BOOLEAN NOT NULL DEFAULT false;
