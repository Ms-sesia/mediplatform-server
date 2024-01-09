-- CreateTable
CREATE TABLE `notiHistory` (
    `ng_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ng_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ng_text` VARCHAR(125) NOT NULL DEFAULT '',
    `userUser_id` INTEGER NULL,

    PRIMARY KEY (`ng_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notiHistory` ADD CONSTRAINT `notiHistory_userUser_id_fkey` FOREIGN KEY (`userUser_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
