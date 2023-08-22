-- AlterTable
ALTER TABLE `defaultSchedule` MODIFY `ds_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `did` MODIFY `did_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `didAttached` MODIFY `da_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `didDoctorRoom` MODIFY `ddr_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `didLowMsg` MODIFY `dlm_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `doctorRoom` MODIFY `dr_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `faq` MODIFY `faq_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `hnComment` MODIFY `hnc_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `hospitalNotice` MODIFY `hn_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `insuranceHistory` MODIFY `ih_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `oneOnOne` MODIFY `oneq_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `oneOnOneAnswer` MODIFY `oneAn_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `patient` MODIFY `pati_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `patientMemo` MODIFY `prm_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `platformNotice` MODIFY `pn_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `pnComment` MODIFY `pnc_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `resAlimTemplate` MODIFY `rat_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `reservation` MODIFY `re_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `specialSchedule` MODIFY `ss_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `specialScheduleHistory` MODIFY `ssh_deleteDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `user_deleteDate` DATETIME(3) NULL;
