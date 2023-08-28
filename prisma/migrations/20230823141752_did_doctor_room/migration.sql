-- CreateTable
CREATE TABLE `didDoctorRoom` (
    `ddr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ddr_info` VARCHAR(25) NOT NULL DEFAULT '',
    `ddr_number` INTEGER NOT NULL DEFAULT 0,
    `ddr_dayOff` BOOLEAN NOT NULL DEFAULT false,
    `ddr_updatedAt` DATETIME(3) NOT NULL,
    `ddr_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ddr_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ddr_editorId` INTEGER NOT NULL DEFAULT 0,
    `ddr_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ddr_deleteDate` DATETIME(3) NULL,
    `did_id` INTEGER NOT NULL,

    PRIMARY KEY (`ddr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `didDoctorRoom` ADD CONSTRAINT `didDoctorRoom_did_id_fkey` FOREIGN KEY (`did_id`) REFERENCES `did`(`did_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
