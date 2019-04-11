var express = require('express');
var router = express.Router();

var paceUsersCtrl = require('./paceUsers-ctrl');
var paceAdmin = require('./paceAdmin-ctrl');


router.get('/checkUser',paceUsersCtrl.checkUser);
router.get('/validatePaceUser',paceUsersCtrl.paceLoginValidation);
router.get('/getUsers',paceUsersCtrl.getUsers);

router.post('/saveTask',paceUsersCtrl.saveTaskPlanner);
router.get('/getTasks',paceUsersCtrl.getTaskPlanner);

router.post('/dashBoard',paceUsersCtrl.getdashBoard);

router.post('/saveTrackerTemplate',paceUsersCtrl.saveTrackerTemplate);
router.get('/baseFile',paceUsersCtrl.getBaseFile);

router.post('/verifyotp',paceUsersCtrl.toVerifyOtp);
router.post('/saveLayout',paceUsersCtrl.saveLayout);

router.get('/mailDetails',paceUsersCtrl.getMailDetails);

router.post('/savePortalDetails',paceUsersCtrl.saveJobPortalUsers);

router.get('/getJobPortalUsers',paceUsersCtrl.getJobPortalUsers);

router.get('/freeJobPortalUsers',paceUsersCtrl.freeJobPortalUsers);

router.post('/checkPortalApplicants',paceUsersCtrl.checkApplicantExists);  // not enc
router.post('/deleteJobPortalUsers',paceUsersCtrl.deleteJobPortalUsers);

router.get('/pacehcmTips',paceUsersCtrl.pacehcmTips);

router.post('/orgChart/branches',paceUsersCtrl.saveOrgChartBranches);
router.post('/orgChart/departments',paceUsersCtrl.saveOrgChartDepartments);
router.post('/orgChart/grades',paceUsersCtrl.saveOrgChartGrades);
router.post('/orgChart/jobtitles',paceUsersCtrl.saveOrgChartJobtitles);

router.get('/orgChart/allData',paceUsersCtrl.getOrgChartData);

router.post('/resetPasswordOtp',paceUsersCtrl.sendPasswordResetOTP);
router.post('/resetPasswordverifyotp',paceUsersCtrl.passwordResetVerifyOtp);
router.post('/resetPassword',paceUsersCtrl.paceresetPassword);

router.post('/smsAppInfo',paceUsersCtrl.sendApplicantInfoToPhone);  // not enc
router.post('/notifyAppInfo',paceUsersCtrl.sendApplicantInfoAsNotification);

router.get('/exportPlanner',paceUsersCtrl.getTaskPlannerForExport);
router.get('/applicants',paceUsersCtrl.getSourcedApplicants);

router.get('/logoutPortalUsers',paceUsersCtrl.logoutPortalUsers);
router.post('/requirements',paceUsersCtrl.getclientRequuirements);

router.get('/smsTemplates',paceUsersCtrl.smsMailTemplates);

router.post('/paceAdmin',paceAdmin.paceAdminDashboard);
router.post('/savePaceAdminConfiguration',paceAdmin.paceSaveHeMasterConfiguration);


module.exports = router;
