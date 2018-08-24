var moment=require('moment');
var express = require('express');
var router = express.Router();

var walkInCvCtrl = require('./walkInCV-ctrl');

router.get('/masterData',walkInCvCtrl.getmasterData); 
router.get('/skillindustryData',walkInCvCtrl.getskillIndustry);
router.post('/candidateData',walkInCvCtrl.saveCandidate);

router.post('/sendOtp',walkInCvCtrl.sendOtp);
router.post('/verifyOtp',walkInCvCtrl.verifyOtp);   // changed to post
router.get('/bannerList',walkInCvCtrl.bannerList);

router.post('/InterviewScheduler',walkInCvCtrl.InterviewSchedulerForPublish);

router.post('/saveWalkInJob',walkInCvCtrl.saveWalkInJobs);
router.get('/getwalkInJobList',walkInCvCtrl.getWalkinJoblist);
router.get('/getUserList',walkInCvCtrl.getUsersOnSearch);

router.post('/visitorCheckIn',walkInCvCtrl.saveVisitorCheckIn);

router.get('/visitor',walkInCvCtrl.getvisitorTracker);
router.post('/userData',walkInCvCtrl.getUser);
router.get('/visitorMaster',walkInCvCtrl.getMaster);

router.post('/visitorListPdf',walkInCvCtrl.getvisitorTrackerPdf);
router.post('/visitorCheckOut',walkInCvCtrl.checkOUT);
router.get('/visitorForceCheckOut',walkInCvCtrl.forceCheckOUT);
router.post('/vendorDetails',walkInCvCtrl.vendorDetails);

router.post('/walkInConfig',walkInCvCtrl.walkInWebConfig);

router.post('/publicWalkInConfig',walkInCvCtrl.publicWalkInConfig);

router.post('/walkincvupload',walkInCvCtrl.walkInCVUpload);

router.get('/validateLink',walkInCvCtrl.walkInUploadLinkFlag);

router.get('/masterDataCVUpdate',walkInCvCtrl.masterDataofCVUpdate);
router.post('/cvSourcingUpdate',walkInCvCtrl.saveCVUpdatedData);

router.post('/walkInPdfGeneration',walkInCvCtrl.walkInPDfGeneration);

router.get('/publicWalkInMasterData',walkInCvCtrl.publicWalkinMaster);

router.get('/companyConfig',walkInCvCtrl.getCompanySearch);


module.exports = router;