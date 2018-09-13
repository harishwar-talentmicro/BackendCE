var express = require('express');
var router = express.Router();

var paceUsersCtrl = require('./paceUsers-ctrl');

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

router.post('/checkPortalApplicants',paceUsersCtrl.checkApplicantExists);
router.post('/deleteJobPortalUsers',paceUsersCtrl.deleteJobPortalUsers);

router.get('/pacehcmTips',paceUsersCtrl.pacehcmTips);

module.exports = router;
