-- CreateTable
CREATE TABLE `alimSet` (
    `upas_id` INTEGER NOT NULL AUTO_INCREMENT,
    `upas_updatedAt` DATETIME(3) NOT NULL,
    `upas_type` ENUM('sms', 'kakao') NOT NULL DEFAULT 'sms',
    `upas_time1` BOOLEAN NOT NULL DEFAULT false,
    `upas_time2` BOOLEAN NOT NULL DEFAULT false,
    `upas_time3` BOOLEAN NOT NULL DEFAULT false,
    `upas_time4` BOOLEAN NOT NULL DEFAULT false,
    `upas_templateId` INTEGER NOT NULL DEFAULT 0,
    `hospitalHsp_id` INTEGER NOT NULL,

    UNIQUE INDEX `alimSet_hospitalHsp_id_key`(`hospitalHsp_id`),
    PRIMARY KEY (`upas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `alimSet` ADD CONSTRAINT `alimSet_hospitalHsp_id_fkey` FOREIGN KEY (`hospitalHsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
