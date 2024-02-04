-- AlterTable
ALTER TABLE `adminPermission` ADD COLUMN `ap_faq` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ap_notice` BOOLEAN NOT NULL DEFAULT false;
