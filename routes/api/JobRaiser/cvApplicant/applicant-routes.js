var moment=require('moment');
var express = require('express');
var router = express.Router();

var applicantCtrl = require('./applicant-Ctrl');
var sendgridCtrl = require('./sendgrid-ctrl');    // for send grid mailing


router.post('/applicant',applicantCtrl.saveApplicant);
router.get('/applicant',applicantCtrl.getApplicantMasterData);

router.post('/reqapplicant',applicantCtrl.saveReqApplicant);
router.get('/reqapplicant',applicantCtrl.getReqApplicantMasterData);

router.get('/applicantList',applicantCtrl.getreqApplicants);
router.get('/applicantDetails',applicantCtrl.getApplicantDetails);

router.get('/stagestatus',applicantCtrl.getreqAppStageStatus);
router.post('/stagestatus',applicantCtrl.saveApplicantStageStatus);

router.get('/requirementList',applicantCtrl.getrequirementList);


router.post('/resumeSearch',applicantCtrl.resumeSearch);
router.post('/reqappMap',applicantCtrl.saveReqAppMapResult);

//router.get('/cvExtract',applicantCtrl.applicantExtractText);

router.get('/names',applicantCtrl.getApplicantNames);

router.get('/interviewPanel',applicantCtrl.getInterviewPanel);

router.post('/interviewSchedule',applicantCtrl.saveInterviewSchedulerNew);
router.get('/getinterviewSchedule',applicantCtrl.getInterviewSchedule);

router.post('/offerManager',applicantCtrl.saveOfferManager);
router.get('/offerManager',applicantCtrl.getOfferManager);

router.post('/sendmail',sendgridCtrl.saveSendMail);

router.get('/interviewScheduler',applicantCtrl.getInterviewScheduler);
router.get('/assessmentTemplate',applicantCtrl.getAssessmentTemplate);

router.get('/resumeReferalMaster',applicantCtrl.getReferralResumeMaster);


router.get('/interviewApplicants',applicantCtrl.getInterviewApplicantList);
router.get('/interviewApplicantDetail',applicantCtrl.getInterviewApplicantDetail);
router.get('/interviewApplicantDetailWeb',applicantCtrl.getInterviewApplicantDetailWeb);

router.get('/masterInterviewScheduler',applicantCtrl.getMasterInterviewScheduler);

router.post('/interviewScheduleForDirectApplicant',applicantCtrl.saveInterviewSchedulerForApplicant);

router.post('/onBoarding',applicantCtrl.saveOnBoarding);

module.exports = router;
