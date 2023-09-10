-- AlterTable
ALTER TABLE `reservation` ADD COLUMN `re_resDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `patient_hsp_id_pati_name_pati_cellphone_pati_chartNumber_idx` ON `patient`(`hsp_id`, `pati_name`, `pati_cellphone`, `pati_chartNumber`);
