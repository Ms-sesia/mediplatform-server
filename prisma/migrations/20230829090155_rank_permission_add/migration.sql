/*
  Warnings:

  - You are about to drop the `userPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `userPermission` DROP FOREIGN KEY `userPermission_user_id_fkey`;

-- DropTable
DROP TABLE `userPermission`;

-- CreateTable
CREATE TABLE `rankPermission` (
    `rp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rp_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rp_updatedAt` DATETIME(3) NOT NULL,
    `rp_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `rp_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `rp_creatorId` INTEGER NOT NULL DEFAULT 0,
    `rp_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `rp_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `rp_editorId` INTEGER NOT NULL DEFAULT 0,
    `rp_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `rp_deleteDate` DATETIME(3) NULL,
    `rp_home` BOOLEAN NOT NULL DEFAULT false,
    `rp_reservation` BOOLEAN NOT NULL DEFAULT false,
    `rp_schedule` BOOLEAN NOT NULL DEFAULT false,
    `rp_patient` BOOLEAN NOT NULL DEFAULT false,
    `rp_did` BOOLEAN NOT NULL DEFAULT false,
    `rp_insurance` BOOLEAN NOT NULL DEFAULT false,
    `rp_cs` BOOLEAN NOT NULL DEFAULT false,
    `rp_setting` BOOLEAN NOT NULL DEFAULT false,
    `rank_id` INTEGER NOT NULL,

    UNIQUE INDEX `rankPermission_rank_id_key`(`rank_id`),
    PRIMARY KEY (`rp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rankPermission` ADD CONSTRAINT `rankPermission_rank_id_fkey` FOREIGN KEY (`rank_id`) REFERENCES `rank`(`rank_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
