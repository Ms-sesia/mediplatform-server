/*
  Warnings:

  - You are about to drop the column `ms_adminEditorId` on the `medicalSubject` table. All the data in the column will be lost.
  - You are about to drop the column `ms_adminEditorName` on the `medicalSubject` table. All the data in the column will be lost.
  - You are about to drop the column `ms_adminEditorRank` on the `medicalSubject` table. All the data in the column will be lost.
  - You are about to drop the column `msd_adminEditorId` on the `medicalSubjectDetail` table. All the data in the column will be lost.
  - You are about to drop the column `msd_adminEditorName` on the `medicalSubjectDetail` table. All the data in the column will be lost.
  - You are about to drop the column `msd_adminEditorRank` on the `medicalSubjectDetail` table. All the data in the column will be lost.
  - You are about to drop the column `org_adminEditorId` on the `org` table. All the data in the column will be lost.
  - You are about to drop the column `org_adminEditorName` on the `org` table. All the data in the column will be lost.
  - You are about to drop the column `org_adminEditorRank` on the `org` table. All the data in the column will be lost.
  - You are about to drop the column `rank_adminEditorId` on the `rank` table. All the data in the column will be lost.
  - You are about to drop the column `rank_adminEditorName` on the `rank` table. All the data in the column will be lost.
  - You are about to drop the column `rank_adminEditorRank` on the `rank` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `medicalSubject` DROP COLUMN `ms_adminEditorId`,
    DROP COLUMN `ms_adminEditorName`,
    DROP COLUMN `ms_adminEditorRank`,
    ADD COLUMN `ms_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `ms_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `ms_editorRank` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `medicalSubjectDetail` DROP COLUMN `msd_adminEditorId`,
    DROP COLUMN `msd_adminEditorName`,
    DROP COLUMN `msd_adminEditorRank`,
    ADD COLUMN `msd_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `msd_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `msd_editorRank` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `org` DROP COLUMN `org_adminEditorId`,
    DROP COLUMN `org_adminEditorName`,
    DROP COLUMN `org_adminEditorRank`,
    ADD COLUMN `org_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `org_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `org_editorRank` VARCHAR(25) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `rank` DROP COLUMN `rank_adminEditorId`,
    DROP COLUMN `rank_adminEditorName`,
    DROP COLUMN `rank_adminEditorRank`,
    ADD COLUMN `rank_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rank_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `rank_editorRank` VARCHAR(25) NOT NULL DEFAULT '';
