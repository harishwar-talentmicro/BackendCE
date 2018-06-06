var moment=require('moment');
var express = require('express');
var router = express.Router();

var walkInCvCtrl = require('./walkInCV-ctrl');

router.get('/masterData',walkInCvCtrl.getmasterData); 
router.get('/skillindustryData',walkInCvCtrl.getskillIndustry);
router.post('/candidateData',walkInCvCtrl.saveCandidate);

router.post('/sendOtp',walkInCvCtrl.sendOtp);
router.get('/verifyOtp',walkInCvCtrl.verifyOtp);
router.get('/bannerList',walkInCvCtrl.bannerList);

router.post('/InterviewScheduler',walkInCvCtrl.InterviewSchedulerForPublish);

router.post('/saveWalkInJob',walkInCvCtrl.saveWalkInJobs);
router.get('/getwalkInJobList',walkInCvCtrl.getWalkinJoblist);
router.get('/getUserList',walkInCvCtrl.getUsersOnSearch);

router.post('/visitorCheckIn',walkInCvCtrl.saveVisitorCheckIn);


module.exports = router;