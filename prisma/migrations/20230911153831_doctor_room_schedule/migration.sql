-- CreateTable
CREATE TABLE `doctorRoomSchedule` (
    `drs_id` INTEGER NOT NULL AUTO_INCREMENT,
    `drs_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `drs_updatedAt` DATETIME(3) NOT NULL,
    `drs_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `drs_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `drs_creatorId` INTEGER NOT NULL DEFAULT 0,
    `drs_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `drs_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `drs_editorId` INTEGER NOT NULL DEFAULT 0,
    `drs_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `drs_day` ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun') NOT NULL,
    `drs_startHour` INTEGER NOT NULL DEFAULT 0,
    `drs_startMin` INTEGER NOT NULL DEFAULT 0,
    `drs_endHour` INTEGER NOT NULL DEFAULT 0,
    `drs_endMin` INTEGER NOT NULL DEFAULT 0,
    `drs_lunchBreak` BOOLEAN NOT NULL DEFAULT false,
    `drs_lbStartHour` INTEGER NOT NULL DEFAULT 0,
    `drs_lbStartMin` INTEGER NOT NULL DEFAULT 0,
    `drs_lbEndHour` INTEGER NOT NULL DEFAULT 0,
    `drs_lbEndMin` INTEGER NOT NULL DEFAULT 0,
    `dr_id` INTEGER NOT NULL,

    PRIMARY KEY (`drs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `doctorRoomSchedule` ADD CONSTRAINT `doctorRoomSchedule_dr_id_fkey` FOREIGN KEY (`dr_id`) REFERENCES `doctorRoom`(`dr_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
