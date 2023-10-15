-- AlterTable
ALTER TABLE `alimSet` MODIFY `as_type` ENUM('sms', 'kakao', 'none') NOT NULL DEFAULT 'sms';

-- AlterTable
ALTER TABLE `resAlim` MODIFY `ra_type` ENUM('sms', 'kakao', 'none') NOT NULL DEFAULT 'sms';

-- AlterTable
ALTER TABLE `userPatientAlimSet` MODIFY `upas_type` ENUM('sms', 'kakao', 'none') NOT NULL DEFAULT 'sms';
