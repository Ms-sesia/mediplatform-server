-- AlterTable
ALTER TABLE `did` ADD COLUMN `did_saveMode` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `userPermission` (
    `up_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rp_home` BOOLEAN NOT NULL DEFAULT true,
    `rp_reservation` BOOLEAN NOT NULL DEFAULT false,
    `rp_schedule` BOOLEAN NOT NULL DEFAULT false,
    `rp_patient` BOOLEAN NOT NULL DEFAULT false,
    `rp_did` BOOLEAN NOT NULL DEFAULT false,
    `rp_insurance` BOOLEAN NOT NULL DEFAULT false,
    `rp_cs` BOOLEAN NOT NULL DEFAULT false,
    `rp_setting` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `userPermission_user_id_key`(`user_id`),
    PRIMARY KEY (`up_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userPermission` ADD CONSTRAINT `userPermission_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
