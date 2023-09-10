-- CreateTable
CREATE TABLE `userPhoneAuthCode` (
    `upac_id` INTEGER NOT NULL AUTO_INCREMENT,
    `upac_createdAt` DATETIME(3) NOT NULL,
    `upac_code` VARCHAR(10) NOT NULL DEFAULT '',
    `upac_cellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`upac_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userPhoneAuthCode` ADD CONSTRAINT `userPhoneAuthCode_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
