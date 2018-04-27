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


module.exports = router;