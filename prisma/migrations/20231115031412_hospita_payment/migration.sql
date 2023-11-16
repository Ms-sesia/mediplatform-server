-- AlterTable
ALTER TABLE `hospital` ADD COLUMN `hsp_cumulativePaymentAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `hsp_thisMonthPaymentAmount` INTEGER NOT NULL DEFAULT 0;
