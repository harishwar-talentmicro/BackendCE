var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration-ctrl');

router.post('/pacebackup',dataMigration.resumeBackUp);
router.get('/tallint_manpower_dashboard',dataMigration.tallint_manpower_dashboard);
router.get('/tallint_requirement_teamMembers',dataMigration.tallint_requirement_teamMembers);

// Employee referral portal
router.get('/tallint_ER_jobList',dataMigration.tallint_ER_jobList);
router.get('/tallint_ER_Dashboard',dataMigration.tallint_ER_Dashboard);
router.get('/tallint_ER_JobDetails',dataMigration.tallint_ER_JobDetails);
router.get('/tallint_ER_Link',dataMigration.tallint_ER_Link);
router.post('/tallint_ER_Like',dataMigration.tallint_ER_Like);
router.post('/tallint_ER_Comment',dataMigration.tallint_ER_Comment);
router.get('/tallint_ER_CommentDetails',dataMigration.tallint_ER_Comment_Details);

router.get('/tallint_ER_ClaimReward',dataMigration.tallint_ER_ClaimReward);
router.get('/tallint_ER_ReqDetails',dataMigration.tallint_ER_ReqDetails);
router.get('/tallint_ER_AppDetails',dataMigration.tallint_ER_AppDetails);
router.post('/tallint_ER_Resume',dataMigration.tallint_ER_Resume);
router.post('/wmateNfn',dataMigration.hcNotification);




module.exports = router;
