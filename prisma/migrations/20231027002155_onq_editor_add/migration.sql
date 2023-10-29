-- AlterTable
ALTER TABLE `oneOnOne` ADD COLUMN `oneq_editorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `oneq_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    ADD COLUMN `oneq_editorRank` VARCHAR(25) NOT NULL DEFAULT '';
