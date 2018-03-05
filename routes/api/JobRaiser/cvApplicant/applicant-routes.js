var moment=require('moment');
var express = require('express');
var router = express.Router();

var applicantCtrl = require('./applicant-Ctrl');

router.post('/applicant',applicantCtrl.saveApplicant);
router.get('/applicant',applicantCtrl.getApplicantMasterData);

router.post('/reqapplicant',applicantCtrl.saveReqApplicant);
router.get('/reqapplicant',applicantCtrl.getReqApplicantMasterData);

router.get('/applicantList',applicantCtrl.getreqApplicants);
router.get('/applicantDetails',applicantCtrl.getApplicantDetails);

router.get('/stagestatus',applicantCtrl.getreqAppStageStatus);
router.post('/stagestatus',applicantCtrl.saveApplicantStageStatus);

//router.get('/globalData',applicantCtrl.getglobalData);
router.get('/requirementList',applicantCtrl.getrequirementList);


router.post('/resumeSearch',applicantCtrl.resumeSearch);
router.post('/reqappMap',applicantCtrl.saveReqAppMapResult);

router.get('/cvExtract',applicantCtrl.applicantExtractText);

router.get('/names',applicantCtrl.getApplicantNames);

module.exports = router;
