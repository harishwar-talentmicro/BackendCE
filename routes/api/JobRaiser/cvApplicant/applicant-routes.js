var moment=require('moment');
var express = require('express');
var router = express.Router();

var applicantCtrl = require('./applicant-Ctrl');
var sendgridCtrl = require('./sendgrid-ctrl');    // for send grid mailing


router.post('/applicant',applicantCtrl.saveApplicant);
router.get('/applicant',applicantCtrl.getApplicantMasterData);

router.post('/reqapplicant',applicantCtrl.saveReqApplicant);
router.get('/reqapplicant',applicantCtrl.getReqApplicantMasterData);

router.post('/applicantList',applicantCtrl.getreqApplicants);
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
router.get('/onBoarding',applicantCtrl.getOnBoarding);

router.post('/medical',applicantCtrl.saveMedical);


router.post('/jobSeekerMailer',sendgridCtrl.jobSeekerPreview);
router.post('/sendJobSeekerMailer',sendgridCtrl.jobSeekerMailer);

router.post('/screeningMailer',sendgridCtrl.ScreeningMailerPreview);
router.post('/sendScreeningMailer',sendgridCtrl.screeningMailer);


router.post('/submissionMailer',sendgridCtrl.SubmissionMailerPreview);
router.post('/sendSubmissionMailer',sendgridCtrl.submissionMailer);

router.post('/clientMailer',sendgridCtrl.clientMailerPreview);
router.post('/sendClientMailer',sendgridCtrl.clientMailer);

router.post('/interviewMailer',sendgridCtrl.interviewMailerPreview);
router.post('/sendInterviewMailer',sendgridCtrl.interviewMailer);


router.post('/saveFacesheet',applicantCtrl.faceSheetTemplate);

router.post('/faceSheetDetails',applicantCtrl.faceSheetReplaceDetails);

router.post('/referFriend',applicantCtrl.referFriend);


router.post('/saveMailSentByGmail',sendgridCtrl.saveMailSentByGmail);


router.post('/importApplicants',applicantCtrl.saveApplicantForImporter);

router.get('/resumeSearchedResults',applicantCtrl.resumeSearchResultsByPage);

router.post('/mailerApplicants',applicantCtrl.getMailerApplicants);


router.post('/screenMailPreview',sendgridCtrl.MobileScreeningMailerPreview);
router.post('/sendScreenMailMobile',sendgridCtrl.SendMobileScreeningMailerPreview);
router.post('/submissionMailerPreview',sendgridCtrl.MobileSubmissionMailerPreview);
router.post('/sendSubmissionMailerMobile',sendgridCtrl.sendSubmissionMailerMobile);

router.post('/reqViewMapApplicant',applicantCtrl.ReqAppMapFromReqView);

router.get('/interviewPanelMembers',applicantCtrl.getPanelMembersForInterviewMailerMobile);

router.post('/interviewMailPreview',sendgridCtrl.interviewMailerPreviewForMobile);
router.post('/sendInterviewMailForMobile',sendgridCtrl.sendInterviewMailerForMobile);

module.exports = router;

