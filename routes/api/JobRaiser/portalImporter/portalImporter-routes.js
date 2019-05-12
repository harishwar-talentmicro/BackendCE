var moment=require('moment');
var express = require('express');
var router = express.Router();

var portalimporter = require('./portalimporter-Ctrl');

router.post('/checkPortalApplicantsMonster',portalimporter.checkApplicantExistsFromMonsterPortal);

router.post('/savePortalApplicantsMonster',portalimporter.saveApplicantsFromMonster);

router.post('/checkPortalApplicantsNaukri',portalimporter.checkApplicantExistsFromNaukriPortal);

router.post('/savePortalApplicantsNaukri',portalimporter.saveApplicantsFromNaukri);

router.post('/checkPortalApplicantsShine',portalimporter.checkApplicantExistsFromShinePortal);

router.post('/checkPortalApplicantsTimesJobs',portalimporter.checkApplicantExistsFromTimesJobsPortal);
router.post('/checkPortalApplicantsTotalJobs',portalimporter.checkApplicantExistsFromTotalJobsPortal);
router.post('/checkPortalApplicantsReed',portalimporter.checkApplicantExistsFromReed);

router.post('/savePortalApplicantsShine',portalimporter.saveApplicantsFromShine);
router.post('/savePortalApplicantsTimesJobs',portalimporter.saveApplicantsFromTimesjobs);
router.post('/savePortalApplicantsTotalJobs',portalimporter.saveApplicantsFromTotalJobs);
router.post('/savePortalApplicantsReed',portalimporter.saveApplicantsFromReed);

router.post('/savePortalApplicantsLinkedIn',portalimporter.savePortalApplicantsLinkedIn);

module.exports = router;