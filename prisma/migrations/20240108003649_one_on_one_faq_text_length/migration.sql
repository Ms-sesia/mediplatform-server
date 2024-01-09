-- AlterTable
ALTER TABLE `faq` MODIFY `faq_answer` VARCHAR(1250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `oneOnOne` MODIFY `oneq_title` VARCHAR(250) NOT NULL DEFAULT '',
    MODIFY `oneq_text` VARCHAR(1250) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `re_appUserId` VARCHAR(250) NOT NULL DEFAULT '';
