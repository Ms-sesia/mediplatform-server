-- AlterTable
ALTER TABLE `didAttached` MODIFY `da_fileType` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `hnAttached` MODIFY `han_fileType` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `oneOnOneAttached` MODIFY `oneAt_fileType` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `pnAttached` MODIFY `pna_fileType` VARCHAR(250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `specialScheduleAttacthed` MODIFY `sa_fileType` VARCHAR(250) NOT NULL DEFAULT '';
