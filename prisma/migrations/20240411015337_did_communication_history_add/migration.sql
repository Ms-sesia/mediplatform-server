-- CreateTable
CREATE TABLE `didCommunicationHistory` (
    `dch_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dch_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dch_type` INTEGER NOT NULL DEFAULT 0,
    `dch_didUniqueId` VARCHAR(125) NOT NULL DEFAULT '',
    `dch_socketId` VARCHAR(125) NOT NULL DEFAULT '',
    `dch_eventName` VARCHAR(125) NOT NULL DEFAULT '',

    PRIMARY KEY (`dch_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
