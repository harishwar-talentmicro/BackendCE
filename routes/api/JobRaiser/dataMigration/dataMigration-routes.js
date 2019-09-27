var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration-ctrl');

router.post('/pacebackup',dataMigration.resumeBackUp);
router.get('/tallint_manpower_dashboard',dataMigration.tallint_manpower_dashboard);
router.get('/tallint_requirement_teamMembers',dataMigration.tallint_requirement_teamMembers);

// Employee referral portal
router.get('/tallint_ER_jobList',dataMigration.tallint_ER_jobList);
router.get('/tallint_ER_Dashboard',dataMigration.tallint_ER_Dashboard);

module.exports = router;
