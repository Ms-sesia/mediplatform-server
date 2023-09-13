-- AlterTable
ALTER TABLE `oneOnOneAnswer` ADD COLUMN `oneAn_adminAble` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `oneAn_creatorId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `oneAn_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN `oneAn_creatorRank` VARCHAR(20) NOT NULL DEFAULT '';
