/**
 * Created by Jana1 on 01-08-2017.
 */

var express = require('express');
var router = express.Router();

var recruitmentCtrl = require('./recruitment-ctrl');

router.post('/manpowerRequest',recruitmentCtrl.manpowerRequest);
router.get('/manpowerRequest/list',recruitmentCtrl.getManpowerList);
router.post('/referResume',recruitmentCtrl.referCV);
router.post('/contactUs',recruitmentCtrl.contactUs);

router.get('/salaryLedger',recruitmentCtrl.getSalaryLedger);
router.get('/interviewScheduler/master',recruitmentCtrl.getInterviewSchedularMasterData);
router.get('/assessmentList',recruitmentCtrl.getAssessmentList);
router.post('/interviewScheduler',recruitmentCtrl.interviewScheduler);

router.get('/informationFinder',recruitmentCtrl.getInformationFinder);
router.get('/speechContent',recruitmentCtrl.extractTextFromFile);

router.post('/document/feedback',recruitmentCtrl.saveDocFeedback);
router.post('/document/readStatus',recruitmentCtrl.saveDocReadStatus);

router.get('/messageDetails',recruitmentCtrl.getmessageDetails);

module.exports = router;