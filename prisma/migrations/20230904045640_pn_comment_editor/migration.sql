/*
  Warnings:

  - You are about to drop the column `pnc_adminEditorId` on the `pnComment` table. All the data in the column will be lost.
  - You are about to drop the column `pnc_adminEditorName` on the `pnComment` table. All the data in the column will be lost.
  - You are about to drop the column `pnc_adminEditorRank` on the `pnComment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pnComment` DROP COLUMN `pnc_adminEditorId`,
    DROP COLUMN `pnc_adminEditorName`,
    DROP COLUMN `pnc_adminEditorRank`,
    ADD COLUMN `pnc_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `pnc_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `pnc_editorRank` VARCHAR(25) NOT NULL DEFAULT '';
