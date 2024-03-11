-- CreateTable
CREATE TABLE `userLoginHistory` (
    `ulh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ulh_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ulh_ip` VARCHAR(20) NOT NULL DEFAULT '',
    `ulh_os` VARCHAR(20) NOT NULL DEFAULT '',
    `ulh_browser` VARCHAR(20) NOT NULL DEFAULT '',
    `ulh_status` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NULL,

    PRIMARY KEY (`ulh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userLoginHistory` ADD CONSTRAINT `userLoginHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
