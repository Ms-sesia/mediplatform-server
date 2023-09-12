-- AlterTable
ALTER TABLE `specialSchedule` MODIFY `ss_startTime` VARCHAR(25) NOT NULL DEFAULT '',
    MODIFY `ss_endTime` VARCHAR(25) NOT NULL DEFAULT '';
