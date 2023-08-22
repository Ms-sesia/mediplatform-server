-- CreateTable
CREATE TABLE `admin` (
    `admin_id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `admin_master` BOOLEAN NOT NULL DEFAULT false,
    `userType` ENUM('user', 'admin') NOT NULL DEFAULT 'admin',
    `admin_name` VARCHAR(20) NOT NULL DEFAULT '',
    `admin_rank` VARCHAR(20) NOT NULL DEFAULT '',
    `admin_email` VARCHAR(50) NOT NULL DEFAULT '',
    `admin_cellphone` VARCHAR(20) NOT NULL DEFAULT '',
    `admin_accountId` VARCHAR(30) NOT NULL DEFAULT '',
    `admin_salt` VARCHAR(50) NOT NULL DEFAULT '',
    `admin_password` VARCHAR(250) NOT NULL DEFAULT '',
    `admin_pwUpdateDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `admin_loginToken` VARCHAR(250) NOT NULL DEFAULT '',

    UNIQUE INDEX `admin_admin_accountId_key`(`admin_accountId`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adminPermission` (
    `ap_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ap_dash` BOOLEAN NOT NULL DEFAULT true,
    `ap_homepage` BOOLEAN NOT NULL DEFAULT false,
    `ap_CS` BOOLEAN NOT NULL DEFAULT false,
    `ap_system` BOOLEAN NOT NULL DEFAULT false,
    `admin_id` INTEGER NOT NULL,

    UNIQUE INDEX `adminPermission_admin_id_key`(`admin_id`),
    PRIMARY KEY (`ap_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adminLoginHistory` (
    `alh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `alh_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alh_ip` VARCHAR(20) NOT NULL DEFAULT '',
    `alh_os` VARCHAR(20) NOT NULL DEFAULT '',
    `alh_browser` VARCHAR(20) NOT NULL DEFAULT '',
    `alh_status` BOOLEAN NOT NULL DEFAULT false,
    `admin_id` INTEGER NOT NULL,

    PRIMARY KEY (`alh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageMain` (
    `hm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hm_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hm_url` VARCHAR(250) NOT NULL DEFAULT '',
    `hm_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hm_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hm_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageIntroduce` (
    `hi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hi_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hi_url` VARCHAR(250) NOT NULL DEFAULT '',
    `hi_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hi_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hi_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageServiceMain` (
    `hsm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsm_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hsm_url` VARCHAR(250) NOT NULL DEFAULT '',
    `hsm_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsm_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsm_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hsm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageServiceDetail` (
    `hsd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsd_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hsd_url` VARCHAR(250) NOT NULL DEFAULT '',
    `hsd_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsd_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsd_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hsd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageCS` (
    `hcs_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hcs_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hcs_url` VARCHAR(250) NOT NULL DEFAULT '',
    `hcs_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hcs_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hcs_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hcs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageServiceContent` (
    `hsc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsc_createdAt` DATETIME(3) NOT NULL,
    `hsc_serviceType` VARCHAR(25) NOT NULL DEFAULT '',
    `hsc_detailTabName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsc_title` VARCHAR(25) NOT NULL DEFAULT '',
    `hsc_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsc_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsc_adminId` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`hsc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageServiceContentDetail` (
    `hsd_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsd_text` VARCHAR(250) NOT NULL DEFAULT '',
    `hsc_id` INTEGER NOT NULL,

    PRIMARY KEY (`hsd_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepageServiceImg` (
    `hsi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsi_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hsi_img` VARCHAR(250) NOT NULL DEFAULT '',
    `hsi_adminName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsi_adminRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsi_adminId` INTEGER NOT NULL DEFAULT 0,
    `hsc_id` INTEGER NOT NULL,

    PRIMARY KEY (`hsi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `generalInquiry` (
    `gi_id` INTEGER NOT NULL AUTO_INCREMENT,
    `gi_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gi_answerStatus` BOOLEAN NOT NULL DEFAULT false,
    `gi_title` VARCHAR(250) NOT NULL DEFAULT '',
    `gi_text` VARCHAR(600) NOT NULL DEFAULT '',
    `gi_name` VARCHAR(25) NOT NULL DEFAULT '',
    `gi_hospitalName` VARCHAR(60) NOT NULL DEFAULT '',
    `gi_workArea` VARCHAR(25) NOT NULL DEFAULT '',
    `gi_cellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `gi_email` VARCHAR(60) NOT NULL DEFAULT '',

    PRIMARY KEY (`gi_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimateInquiry` (
    `ei_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ei_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ei_answerStatus` BOOLEAN NOT NULL DEFAULT false,
    `ei_medicalSub` VARCHAR(125) NOT NULL DEFAULT '',
    `ei_pcCount` VARCHAR(250) NOT NULL DEFAULT '',
    `ei_RDR` BOOLEAN NOT NULL DEFAULT false,
    `ei_CR` BOOLEAN NOT NULL DEFAULT false,
    `ei_XRAY` BOOLEAN NOT NULL DEFAULT false,
    `ei_CArm` BOOLEAN NOT NULL DEFAULT false,
    `ei_Mammography` BOOLEAN NOT NULL DEFAULT false,
    `ei_ultrasonicWave` BOOLEAN NOT NULL DEFAULT false,
    `ei_endoscope` BOOLEAN NOT NULL DEFAULT false,
    `ei_CT` BOOLEAN NOT NULL DEFAULT false,
    `ei_MRI` BOOLEAN NOT NULL DEFAULT false,
    `ei_arteriosclerosis` BOOLEAN NOT NULL DEFAULT false,
    `ei_spirometer` BOOLEAN NOT NULL DEFAULT false,
    `ei_ECG` BOOLEAN NOT NULL DEFAULT false,
    `ei_PACS` BOOLEAN NOT NULL DEFAULT false,
    `ei_remoteImageReading` BOOLEAN NOT NULL DEFAULT false,
    `ei_name` VARCHAR(25) NOT NULL DEFAULT '',
    `ei_hospitalName` VARCHAR(60) NOT NULL DEFAULT '',
    `ei_workArea` VARCHAR(25) NOT NULL DEFAULT '',
    `ei_cellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `ei_email` VARCHAR(60) NOT NULL DEFAULT '',
    `ei_etc` VARCHAR(250) NOT NULL DEFAULT '',

    PRIMARY KEY (`ei_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospital` (
    `hsp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hsp_email` VARCHAR(55) NOT NULL DEFAULT '',
    `hsp_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hsp_updatedAt` DATETIME(3) NOT NULL,
    `hsp_adminCreatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_adminCreatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_adminCreatorId` INTEGER NOT NULL DEFAULT 0,
    `hsp_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_editorId` INTEGER NOT NULL DEFAULT 0,
    `hsp_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `hsp_deleteDate` DATETIME(3) NOT NULL,
    `hsp_name` VARCHAR(65) NOT NULL DEFAULT '',
    `hsp_chief` VARCHAR(20) NOT NULL DEFAULT '',
    `hsp_hospitalNumber` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_businessNumber` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_phone` VARCHAR(20) NOT NULL DEFAULT '',
    `hsp_country` VARCHAR(50) NOT NULL DEFAULT '',
    `hsp_address` VARCHAR(55) NOT NULL DEFAULT '',
    `hsp_detailAddress` VARCHAR(55) NOT NULL DEFAULT '',
    `hsp_medicalDepartment` VARCHAR(25) NOT NULL DEFAULT '',
    `hsp_kakaoChannelId` VARCHAR(55) NOT NULL DEFAULT '',
    `hsp_kakaoChannelUrl` VARCHAR(55) NOT NULL DEFAULT '',
    `hsp_useStartDate` DATETIME(3) NOT NULL,
    `hsp_useEndDate` DATETIME(3) NOT NULL,
    `hsp_useEnded` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `hospital_hsp_email_key`(`hsp_email`),
    PRIMARY KEY (`hsp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospitalPayment` (
    `hp_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hp_paymentDate` DATETIME(3) NOT NULL,
    `hp_paymentAmount` INTEGER NOT NULL DEFAULT 0,
    `hp_paymentType` ENUM('did', 'platform') NOT NULL DEFAULT 'did',
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`hp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_updatedAt` DATETIME(3) NOT NULL,
    `user_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `user_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `user_creatorId` INTEGER NOT NULL DEFAULT 0,
    `user_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `user_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `user_editorId` INTEGER NOT NULL DEFAULT 0,
    `user_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `user_deleteDate` DATETIME(3) NOT NULL,
    `userType` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `user_name` VARCHAR(25) NOT NULL DEFAULT '',
    `user_birthday` VARCHAR(25) NOT NULL DEFAULT '',
    `user_cellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `user_email` VARCHAR(125) NOT NULL DEFAULT '',
    `user_permission` VARCHAR(25) NOT NULL DEFAULT '',
    `user_org` VARCHAR(25) NOT NULL DEFAULT '',
    `user_rank` VARCHAR(25) NOT NULL DEFAULT '',
    `user_job` VARCHAR(25) NOT NULL DEFAULT '',
    `user_salt` VARCHAR(50) NOT NULL DEFAULT '',
    `user_password` VARCHAR(250) NOT NULL DEFAULT '',
    `user_passwordInit` BOOLEAN NOT NULL DEFAULT true,
    `user_pwUpdateDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_img` VARCHAR(250) NOT NULL DEFAULT '',
    `user_hnAlim` BOOLEAN NOT NULL DEFAULT true,
    `user_pnAlim` BOOLEAN NOT NULL DEFAULT true,
    `user_resAlim` BOOLEAN NOT NULL DEFAULT true,
    `user_specialAlim` BOOLEAN NOT NULL DEFAULT true,
    `user_withdrwal` BOOLEAN NOT NULL DEFAULT false,
    `hsp_id` INTEGER NOT NULL,

    UNIQUE INDEX `user_user_email_key`(`user_email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPermission` (
    `up_id` INTEGER NOT NULL AUTO_INCREMENT,
    `up_home` BOOLEAN NOT NULL DEFAULT false,
    `up_reservation` BOOLEAN NOT NULL DEFAULT false,
    `up_schedule` BOOLEAN NOT NULL DEFAULT false,
    `up_patient` BOOLEAN NOT NULL DEFAULT false,
    `up_did` BOOLEAN NOT NULL DEFAULT false,
    `up_insurance` BOOLEAN NOT NULL DEFAULT false,
    `up_cs` BOOLEAN NOT NULL DEFAULT false,
    `up_setting` BOOLEAN NOT NULL DEFAULT false,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`up_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `searchHistory` (
    `sh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sh_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sh_text` VARCHAR(65) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`sh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPatientAlimSet` (
    `upas_id` INTEGER NOT NULL AUTO_INCREMENT,
    `upas_updatedAt` DATETIME(3) NOT NULL,
    `upas_type` ENUM('sms', 'kakao') NOT NULL DEFAULT 'sms',
    `upas_time1` BOOLEAN NOT NULL DEFAULT false,
    `upas_time2` BOOLEAN NOT NULL DEFAULT false,
    `upas_time3` BOOLEAN NOT NULL DEFAULT false,
    `upas_time4` BOOLEAN NOT NULL DEFAULT false,
    `upas_templateId` INTEGER NOT NULL DEFAULT 0,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `userPatientAlimSet_user_id_key`(`user_id`),
    PRIMARY KEY (`upas_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient` (
    `pati_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pati_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pati_updatedAt` DATETIME(3) NOT NULL,
    `pati_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_creatorId` INTEGER NOT NULL DEFAULT 0,
    `pati_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_editorId` INTEGER NOT NULL DEFAULT 0,
    `pati_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `pati_deleteDate` DATETIME(3) NOT NULL,
    `pati_name` VARCHAR(20) NOT NULL DEFAULT '',
    `pati_rrn` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_cellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_chartNumber` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_gender` BOOLEAN NOT NULL DEFAULT false,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`pati_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patientMemo` (
    `prm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `prm_text` VARCHAR(250) NOT NULL DEFAULT '',
    `prm_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prm_updatedAt` DATETIME(3) NOT NULL,
    `prm_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `prm_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `prm_creatorId` INTEGER NOT NULL DEFAULT 0,
    `prm_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `prm_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `prm_editorId` INTEGER NOT NULL DEFAULT 0,
    `prm_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `prm_deleteDate` DATETIME(3) NOT NULL,
    `pati_id` INTEGER NOT NULL,

    PRIMARY KEY (`prm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `re_id` INTEGER NOT NULL AUTO_INCREMENT,
    `re_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `re_updatedAt` DATETIME(3) NOT NULL,
    `re_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `re_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `re_creatorId` INTEGER NOT NULL DEFAULT 0,
    `re_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `re_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `re_editorId` INTEGER NOT NULL DEFAULT 0,
    `re_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `re_deleteDate` DATETIME(3) NOT NULL,
    `re_year` INTEGER NOT NULL DEFAULT 0,
    `re_month` INTEGER NOT NULL DEFAULT 0,
    `re_date` INTEGER NOT NULL DEFAULT 0,
    `re_time` VARCHAR(10) NOT NULL DEFAULT '',
    `re_status` ENUM('waiting', 'complet', 'confirm', 'cancel') NOT NULL DEFAULT 'waiting',
    `re_platform` ENUM('naver', 'kakao', 'platform', 'emr') NOT NULL DEFAULT 'platform',
    `re_patientName` VARCHAR(20) NOT NULL DEFAULT '',
    `re_patientRrn` VARCHAR(25) NOT NULL DEFAULT '',
    `re_patientCellphone` VARCHAR(25) NOT NULL DEFAULT '',
    `re_oneLineMem` VARCHAR(65) NOT NULL DEFAULT '',
    `re_confirmUserName` VARCHAR(20) NOT NULL DEFAULT '',
    `re_confirmUserRank` VARCHAR(20) NOT NULL DEFAULT '',
    `re_confirmDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `re_LCategory` VARCHAR(65) NOT NULL DEFAULT '',
    `re_SCategory` VARCHAR(65) NOT NULL DEFAULT '',
    `re_medicalRoom` VARCHAR(25) NOT NULL DEFAULT '',
    `pati_id` INTEGER NOT NULL,
    `hsp_id` INTEGER NOT NULL,

    INDEX `reservation_hsp_id_re_year_re_month_re_date_idx`(`hsp_id`, `re_year`, `re_month`, `re_date`),
    PRIMARY KEY (`re_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resAlim` (
    `ra_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ra_type` ENUM('sms', 'kakao') NOT NULL DEFAULT 'sms',
    `ra_time1` BOOLEAN NOT NULL DEFAULT false,
    `ra_time2` BOOLEAN NOT NULL DEFAULT false,
    `ra_time3` BOOLEAN NOT NULL DEFAULT false,
    `ra_time4` BOOLEAN NOT NULL DEFAULT false,
    `ra_templateId` INTEGER NOT NULL DEFAULT 0,
    `re_id` INTEGER NOT NULL,

    UNIQUE INDEX `resAlim_re_id_key`(`re_id`),
    PRIMARY KEY (`ra_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resAlimTemplate` (
    `rat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rat_title` VARCHAR(125) NOT NULL DEFAULT '',
    `rat_text` VARCHAR(375) NOT NULL DEFAULT '',
    `rat_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rat_updatedAt` DATETIME(3) NOT NULL,
    `rat_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `rat_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `rat_creatorId` INTEGER NOT NULL DEFAULT 0,
    `rat_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `rat_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `rat_editorId` INTEGER NOT NULL DEFAULT 0,
    `rat_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `rat_deleteDate` DATETIME(3) NOT NULL,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`rat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `defaultSchedule` (
    `ds_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ds_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ds_updatedAt` DATETIME(3) NOT NULL,
    `ds_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ds_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ds_creatorId` INTEGER NOT NULL DEFAULT 0,
    `ds_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ds_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ds_editorId` INTEGER NOT NULL DEFAULT 0,
    `ds_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ds_deleteDate` DATETIME(3) NOT NULL,
    `ds_day` ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun') NOT NULL,
    `ds_startHour` INTEGER NOT NULL DEFAULT 0,
    `ds_startMin` INTEGER NOT NULL DEFAULT 0,
    `ds_endHour` INTEGER NOT NULL DEFAULT 0,
    `ds_endMin` INTEGER NOT NULL DEFAULT 0,
    `ds_lunchBreak` BOOLEAN NOT NULL DEFAULT false,
    `ds_lbStartHour` INTEGER NOT NULL DEFAULT 0,
    `ds_lbStartMin` INTEGER NOT NULL DEFAULT 0,
    `ds_lbEndHour` INTEGER NOT NULL DEFAULT 0,
    `ds_lbEndMin` INTEGER NOT NULL DEFAULT 0,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`ds_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialSchedule` (
    `ss_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ss_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ss_updatedAt` DATETIME(3) NOT NULL,
    `ss_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ss_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ss_creatorId` INTEGER NOT NULL DEFAULT 0,
    `ss_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ss_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ss_editorId` INTEGER NOT NULL DEFAULT 0,
    `ss_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ss_deleteDate` DATETIME(3) NOT NULL,
    `ss_roomType` VARCHAR(35) NOT NULL DEFAULT '',
    `ss_doctorName` VARCHAR(20) NOT NULL DEFAULT '',
    `ss_startYear` INTEGER NOT NULL DEFAULT 0,
    `ss_startMonth` INTEGER NOT NULL DEFAULT 0,
    `ss_startDate` INTEGER NOT NULL DEFAULT 0,
    `ss_endYear` INTEGER NOT NULL DEFAULT 0,
    `ss_endMonth` INTEGER NOT NULL DEFAULT 0,
    `ss_endDate` INTEGER NOT NULL DEFAULT 0,
    `ss_subUsed` BOOLEAN NOT NULL DEFAULT false,
    `ss_startTime` INTEGER NOT NULL DEFAULT 0,
    `ss_endTime` INTEGER NOT NULL DEFAULT 0,
    `ss_dayoff` BOOLEAN NOT NULL DEFAULT false,
    `ss_memo` VARCHAR(250) NOT NULL DEFAULT '',
    `ss_status` ENUM('notSign', 'sign', 'reject') NOT NULL DEFAULT 'notSign',
    `hsp_id` INTEGER NOT NULL,
    `ddr_id` INTEGER NULL,
    `dr_id` INTEGER NULL,

    PRIMARY KEY (`ss_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialScheduleAttacthed` (
    `sa_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sa_url` VARCHAR(300) NOT NULL DEFAULT '',
    `ss_id` INTEGER NOT NULL,

    PRIMARY KEY (`sa_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialScheduleHistory` (
    `ssh_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ssh_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ssh_updatedAt` DATETIME(3) NOT NULL,
    `ssh_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ssh_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ssh_creatorId` INTEGER NOT NULL DEFAULT 0,
    `ssh_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ssh_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ssh_editorId` INTEGER NOT NULL DEFAULT 0,
    `ssh_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ssh_deleteDate` DATETIME(3) NOT NULL,
    `ssh_text` VARCHAR(250) NOT NULL DEFAULT '',
    `ss_id` INTEGER NOT NULL,

    PRIMARY KEY (`ssh_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `doctorRoom` (
    `dr_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dr_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dr_updatedAt` DATETIME(3) NOT NULL,
    `dr_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `dr_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `dr_creatorId` INTEGER NOT NULL DEFAULT 0,
    `dr_editorName` INTEGER NOT NULL DEFAULT 0,
    `dr_editorRank` INTEGER NOT NULL DEFAULT 0,
    `dr_editorId` INTEGER NOT NULL DEFAULT 0,
    `dr_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `dr_deleteDate` DATETIME(3) NOT NULL,
    `dr_doctorRoomCode` VARCHAR(50) NOT NULL DEFAULT '',
    `dr_roomName` VARCHAR(60) NOT NULL DEFAULT '',
    `dr_doctorName` VARCHAR(25) NOT NULL DEFAULT '',
    `dr_doctorRank` VARCHAR(25) NOT NULL DEFAULT '',

    PRIMARY KEY (`dr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `did` (
    `did_id` INTEGER NOT NULL AUTO_INCREMENT,
    `did_title` VARCHAR(150) NOT NULL DEFAULT '',
    `did_doctorRoomExpression` VARCHAR(50) NOT NULL DEFAULT '',
    `did_standbyPersonExpression` VARCHAR(50) NOT NULL DEFAULT '',
    `did_erColorUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_erColor` VARCHAR(20) NOT NULL DEFAULT '',
    `did_holdingColorUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_holdingColor` VARCHAR(20) NOT NULL DEFAULT '',
    `did_standbyPersonFontsize` VARCHAR(20) NOT NULL DEFAULT '',
    `did_calledPersonFontsize` VARCHAR(20) NOT NULL DEFAULT '',
    `did_calledTextUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_calledVoiceUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `did_updatedAt` DATETIME(3) NOT NULL,
    `did_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `did_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `did_creatorId` INTEGER NOT NULL DEFAULT 0,
    `did_editorName` INTEGER NOT NULL DEFAULT 0,
    `did_editorRank` INTEGER NOT NULL DEFAULT 0,
    `did_editorId` INTEGER NOT NULL DEFAULT 0,
    `did_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `did_deleteDate` DATETIME(3) NOT NULL,
    `did_monitorType` ENUM('vertical', 'horizontal') NOT NULL DEFAULT 'horizontal',
    `did_mediaType` ENUM('image', 'video', 'patient') NOT NULL DEFAULT 'image',
    `did_resUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_transmitType` ENUM('empty', 'always', 'sometimes') NOT NULL DEFAULT 'empty',
    `did_resInfoLocation` ENUM('up', 'down', 'left', 'right') NOT NULL DEFAULT 'left',
    `did_monitorRatio` VARCHAR(10) NOT NULL DEFAULT '',
    `did_patExpress1` ENUM('empty', 'patName', 'doctorRoom', 'gender', 'time', 'doctor', 'status', 'chartNumber', 'birthday', 'age', 'memo') NOT NULL DEFAULT 'empty',
    `did_patExpRatio1` INTEGER NOT NULL DEFAULT 0,
    `did_patExpress2` ENUM('empty', 'patName', 'doctorRoom', 'gender', 'time', 'doctor', 'status', 'chartNumber', 'birthday', 'age', 'memo') NOT NULL DEFAULT 'empty',
    `did_patExpRatio2` INTEGER NOT NULL DEFAULT 0,
    `did_patExpress3` ENUM('empty', 'patName', 'doctorRoom', 'gender', 'time', 'doctor', 'status', 'chartNumber', 'birthday', 'age', 'memo') NOT NULL DEFAULT 'empty',
    `did_patExpRatio3` INTEGER NOT NULL DEFAULT 0,
    `did_patExpress4` ENUM('empty', 'patName', 'doctorRoom', 'gender', 'time', 'doctor', 'status', 'chartNumber', 'birthday', 'age', 'memo') NOT NULL DEFAULT 'empty',
    `did_patExpRatio4` INTEGER NOT NULL DEFAULT 0,
    `did_lowMsgUsed` BOOLEAN NOT NULL DEFAULT false,
    `did_resInfoTime` INTEGER NOT NULL DEFAULT 0,
    `did_resInfoCycle` INTEGER NOT NULL DEFAULT 0,
    `did_doctorRoomMerge` BOOLEAN NOT NULL DEFAULT false,
    `did_uniqueId` VARCHAR(125) NOT NULL DEFAULT '',
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`did_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `didAttached` (
    `da_id` INTEGER NOT NULL AUTO_INCREMENT,
    `da_url` VARCHAR(250) NOT NULL DEFAULT '',
    `da_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `da_updatedAt` DATETIME(3) NOT NULL,
    `da_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `da_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `da_creatorId` INTEGER NOT NULL DEFAULT 0,
    `da_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `da_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `da_editorId` INTEGER NOT NULL DEFAULT 0,
    `da_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `da_deleteDate` DATETIME(3) NOT NULL,
    `da_number` INTEGER NOT NULL DEFAULT 0,
    `did_id` INTEGER NOT NULL,

    PRIMARY KEY (`da_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `didLowMsg` (
    `dlm_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dlm_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dlm_updatedAt` DATETIME(3) NOT NULL,
    `dlm_number` INTEGER NOT NULL DEFAULT 0,
    `dlm_text` VARCHAR(250) NOT NULL DEFAULT '',
    `dlm_creatorName` VARCHAR(25) NOT NULL DEFAULT '',
    `dlm_creatorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `dlm_creatorId` INTEGER NOT NULL DEFAULT 0,
    `dlm_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `dlm_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `dlm_editorId` INTEGER NOT NULL DEFAULT 0,
    `dlm_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `dlm_deleteDate` DATETIME(3) NOT NULL,
    `did_id` INTEGER NOT NULL,

    PRIMARY KEY (`dlm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `ddr_deleteDate` DATETIME(3) NOT NULL,
    `did_id` INTEGER NOT NULL,

    PRIMARY KEY (`ddr_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insuranceHistory` (
    `ih_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ih_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ih_companyName` VARCHAR(25) NOT NULL DEFAULT '',
    `ih_reqNumber` VARCHAR(65) NOT NULL DEFAULT '',
    `ih_patientChartNumber` VARCHAR(25) NOT NULL DEFAULT '',
    `ih_patientName` VARCHAR(20) NOT NULL DEFAULT '',
    `ih_status` ENUM('complete', 'fail', 'processing') NOT NULL DEFAULT 'processing',
    `ih_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ih_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ih_editorId` INTEGER NOT NULL DEFAULT 0,
    `ih_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `ih_deleteDate` DATETIME(3) NOT NULL,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`ih_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ihText` (
    `iht_id` INTEGER NOT NULL AUTO_INCREMENT,
    `iht_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `iht_text` VARCHAR(250) NOT NULL DEFAULT '',
    `ih_id` INTEGER NOT NULL,

    PRIMARY KEY (`iht_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hospitalNotice` (
    `hn_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hn_title` VARCHAR(125) NOT NULL DEFAULT '',
    `hn_text` VARCHAR(600) NOT NULL DEFAULT '',
    `hn_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hn_updatedAt` DATETIME(3) NOT NULL,
    `hn_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `hn_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `hn_creatorId` INTEGER NOT NULL DEFAULT 0,
    `hn_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `hn_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hn_editorId` INTEGER NOT NULL DEFAULT 0,
    `hn_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `hn_deleteDate` DATETIME(3) NOT NULL,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`hn_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hnAttached` (
    `hna_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hna_url` VARCHAR(300) NOT NULL DEFAULT '',
    `hn_id` INTEGER NOT NULL,

    PRIMARY KEY (`hna_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hnComment` (
    `hnc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `hnc_text` VARCHAR(125) NOT NULL DEFAULT '',
    `hnc_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hnc_updatedAt` DATETIME(3) NOT NULL,
    `hnc_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `hnc_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `hnc_creatorId` INTEGER NOT NULL DEFAULT 0,
    `hnc_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `hnc_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `hnc_editorId` INTEGER NOT NULL DEFAULT 0,
    `hnc_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `hnc_deleteDate` DATETIME(3) NOT NULL,
    `hn_id` INTEGER NOT NULL,

    PRIMARY KEY (`hnc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platformNotice` (
    `pn_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pn_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pn_updatedAt` DATETIME(3) NOT NULL,
    `pn_type` ENUM('normal', 'emergency', 'update') NOT NULL DEFAULT 'normal',
    `pn_title` VARCHAR(125) NOT NULL DEFAULT '',
    `pn_text` VARCHAR(600) NOT NULL DEFAULT '',
    `pn_adminCreatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `pn_adminCreatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `pn_adminCreatorId` INTEGER NOT NULL DEFAULT 0,
    `pn_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `pn_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `pn_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `pn_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `pn_deleteDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`pn_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platformNoticeCheck` (
    `pnc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pnc_check` BOOLEAN NOT NULL DEFAULT true,
    `pn_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`pnc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pnAttached` (
    `pna_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pna_url` VARCHAR(300) NOT NULL DEFAULT '',
    `pn_id` INTEGER NOT NULL,

    PRIMARY KEY (`pna_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pnComment` (
    `pnc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pnc_text` VARCHAR(125) NOT NULL DEFAULT '',
    `pnc_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pnc_updatedAt` DATETIME(3) NOT NULL,
    `pnc_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `pnc_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `pnc_creatorId` INTEGER NOT NULL DEFAULT 0,
    `pnc_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `pnc_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `pnc_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `pnc_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `pnc_deleteDate` DATETIME(3) NOT NULL,
    `pn_id` INTEGER NOT NULL,

    PRIMARY KEY (`pnc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `faq_id` INTEGER NOT NULL AUTO_INCREMENT,
    `faq_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `faq_updatedAt` DATETIME(3) NOT NULL,
    `faq_question` VARCHAR(250) NOT NULL DEFAULT '',
    `faq_answer` VARCHAR(250) NOT NULL DEFAULT '',
    `faq_viewCount` INTEGER NOT NULL DEFAULT 0,
    `faq_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `faq_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `faq_creatorId` INTEGER NOT NULL DEFAULT 0,
    `faq_adminEditorName` VARCHAR(25) NOT NULL DEFAULT '',
    `faq_adminEditorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `faq_adminEditorId` INTEGER NOT NULL DEFAULT 0,
    `faq_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `faq_deleteDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`faq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqLike` (
    `fl_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fl_like` BOOLEAN NOT NULL DEFAULT false,
    `fl_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fl_updatedAt` DATETIME(3) NOT NULL,
    `faq_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`fl_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oneOnOne` (
    `oneq_id` INTEGER NOT NULL AUTO_INCREMENT,
    `oneq_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oneq_title` VARCHAR(125) NOT NULL DEFAULT '',
    `oneq_text` VARCHAR(125) NOT NULL DEFAULT '',
    `oneq_creatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `oneq_creatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `oneq_creatorId` INTEGER NOT NULL DEFAULT 0,
    `oneq_status` BOOLEAN NOT NULL DEFAULT false,
    `oneq_publicPrivate` BOOLEAN NOT NULL DEFAULT false,
    `oneq_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `oneq_deleteDate` DATETIME(3) NOT NULL,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`oneq_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oneOnOneAttached` (
    `oneAt_id` INTEGER NOT NULL AUTO_INCREMENT,
    `oneAt_url` VARCHAR(250) NOT NULL DEFAULT '',
    `oneq_id` INTEGER NOT NULL,

    PRIMARY KEY (`oneAt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oneOnOneAnswer` (
    `oneAn_id` INTEGER NOT NULL AUTO_INCREMENT,
    `oneAn_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oneAn_answer` VARCHAR(250) NOT NULL DEFAULT '',
    `oneAn_adminCreatorName` VARCHAR(20) NOT NULL DEFAULT '',
    `oneAn_adminCreatorRank` VARCHAR(20) NOT NULL DEFAULT '',
    `oneAn_adminCreatorId` INTEGER NOT NULL DEFAULT 0,
    `oneAn_isDelete` BOOLEAN NOT NULL DEFAULT false,
    `oneAn_deleteDate` DATETIME(3) NOT NULL,
    `oneq_id` INTEGER NOT NULL,

    PRIMARY KEY (`oneAn_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userUpdateLog` (
    `ul_id` INTEGER NOT NULL AUTO_INCREMENT,
    `ul_createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ul_employeeNumber` VARCHAR(25) NOT NULL DEFAULT '',
    `ul_adminTeam` VARCHAR(20) NOT NULL DEFAULT '',
    `ul_adminName` VARCHAR(20) NOT NULL DEFAULT '',
    `ul_content` VARCHAR(250) NOT NULL DEFAULT '',
    `ul_editorName` VARCHAR(25) NOT NULL DEFAULT '',
    `ul_editorRank` VARCHAR(25) NOT NULL DEFAULT '',
    `ul_editorId` INTEGER NOT NULL DEFAULT 0,
    `hsp_id` INTEGER NOT NULL,

    PRIMARY KEY (`ul_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `adminPermission` ADD CONSTRAINT `adminPermission_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adminLoginHistory` ADD CONSTRAINT `adminLoginHistory_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homepageServiceContentDetail` ADD CONSTRAINT `homepageServiceContentDetail_hsc_id_fkey` FOREIGN KEY (`hsc_id`) REFERENCES `homepageServiceContent`(`hsc_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homepageServiceImg` ADD CONSTRAINT `homepageServiceImg_hsc_id_fkey` FOREIGN KEY (`hsc_id`) REFERENCES `homepageServiceContent`(`hsc_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hospitalPayment` ADD CONSTRAINT `hospitalPayment_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPermission` ADD CONSTRAINT `userPermission_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `searchHistory` ADD CONSTRAINT `searchHistory_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPatientAlimSet` ADD CONSTRAINT `userPatientAlimSet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient` ADD CONSTRAINT `patient_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patientMemo` ADD CONSTRAINT `patientMemo_pati_id_fkey` FOREIGN KEY (`pati_id`) REFERENCES `patient`(`pati_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_pati_id_fkey` FOREIGN KEY (`pati_id`) REFERENCES `patient`(`pati_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resAlim` ADD CONSTRAINT `resAlim_re_id_fkey` FOREIGN KEY (`re_id`) REFERENCES `reservation`(`re_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resAlimTemplate` ADD CONSTRAINT `resAlimTemplate_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `defaultSchedule` ADD CONSTRAINT `defaultSchedule_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specialSchedule` ADD CONSTRAINT `specialSchedule_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specialSchedule` ADD CONSTRAINT `specialSchedule_ddr_id_fkey` FOREIGN KEY (`ddr_id`) REFERENCES `didDoctorRoom`(`ddr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specialSchedule` ADD CONSTRAINT `specialSchedule_dr_id_fkey` FOREIGN KEY (`dr_id`) REFERENCES `doctorRoom`(`dr_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specialScheduleAttacthed` ADD CONSTRAINT `specialScheduleAttacthed_ss_id_fkey` FOREIGN KEY (`ss_id`) REFERENCES `specialSchedule`(`ss_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specialScheduleHistory` ADD CONSTRAINT `specialScheduleHistory_ss_id_fkey` FOREIGN KEY (`ss_id`) REFERENCES `specialSchedule`(`ss_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `did` ADD CONSTRAINT `did_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `didAttached` ADD CONSTRAINT `didAttached_did_id_fkey` FOREIGN KEY (`did_id`) REFERENCES `did`(`did_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `didLowMsg` ADD CONSTRAINT `didLowMsg_did_id_fkey` FOREIGN KEY (`did_id`) REFERENCES `did`(`did_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `didDoctorRoom` ADD CONSTRAINT `didDoctorRoom_did_id_fkey` FOREIGN KEY (`did_id`) REFERENCES `did`(`did_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insuranceHistory` ADD CONSTRAINT `insuranceHistory_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ihText` ADD CONSTRAINT `ihText_ih_id_fkey` FOREIGN KEY (`ih_id`) REFERENCES `insuranceHistory`(`ih_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hospitalNotice` ADD CONSTRAINT `hospitalNotice_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hnAttached` ADD CONSTRAINT `hnAttached_hn_id_fkey` FOREIGN KEY (`hn_id`) REFERENCES `hospitalNotice`(`hn_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hnComment` ADD CONSTRAINT `hnComment_hn_id_fkey` FOREIGN KEY (`hn_id`) REFERENCES `hospitalNotice`(`hn_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platformNoticeCheck` ADD CONSTRAINT `platformNoticeCheck_pn_id_fkey` FOREIGN KEY (`pn_id`) REFERENCES `platformNotice`(`pn_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platformNoticeCheck` ADD CONSTRAINT `platformNoticeCheck_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pnAttached` ADD CONSTRAINT `pnAttached_pn_id_fkey` FOREIGN KEY (`pn_id`) REFERENCES `platformNotice`(`pn_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pnComment` ADD CONSTRAINT `pnComment_pn_id_fkey` FOREIGN KEY (`pn_id`) REFERENCES `platformNotice`(`pn_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faqLike` ADD CONSTRAINT `faqLike_faq_id_fkey` FOREIGN KEY (`faq_id`) REFERENCES `faq`(`faq_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faqLike` ADD CONSTRAINT `faqLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oneOnOne` ADD CONSTRAINT `oneOnOne_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oneOnOneAttached` ADD CONSTRAINT `oneOnOneAttached_oneq_id_fkey` FOREIGN KEY (`oneq_id`) REFERENCES `oneOnOne`(`oneq_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oneOnOneAnswer` ADD CONSTRAINT `oneOnOneAnswer_oneq_id_fkey` FOREIGN KEY (`oneq_id`) REFERENCES `oneOnOne`(`oneq_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userUpdateLog` ADD CONSTRAINT `userUpdateLog_hsp_id_fkey` FOREIGN KEY (`hsp_id`) REFERENCES `hospital`(`hsp_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
