var moment=require('moment');
var express = require('express');
var router = express.Router();

var portalimporter = require('./portalimporter-Ctrl');

router.post('/checkPortalApplicantsMonster',portalimporter.checkApplicantExistsFromMonsterPortal);
router.post('/checkPortalApplicantsNaukri',portalimporter.checkApplicantExistsFromNaukriPortal);
router.post('/checkPortalApplicantsShine',portalimporter.checkApplicantExistsFromShinePortal);
router.post('/checkPortalApplicantsTimesJobs',portalimporter.checkApplicantExistsFromTimesJobsPortalNew);
router.post('/checkPortalApplicantsTotalJobs',portalimporter.checkApplicantExistsFromTotalJobsPortal);
router.post('/checkPortalApplicantsReed',portalimporter.checkApplicantExistsFromReed);
router.post('/checkPortalApplicantsJobStreet',portalimporter.checkApplicantExistsFromJobStreetPortal);
router.post('/checkPortalApplicantsBestJobs',portalimporter.checkApplicantExistsFromBestJobsPortal);
router.post('/checkPortalApplicantsJobSearch',portalimporter.checkApplicantExistsFromJobSearchPortal);

router.post('/savePortalApplicantsMonster',portalimporter.saveApplicantsFromMonster);
router.post('/savePortalApplicantsNaukri',portalimporter.saveApplicantsFromNaukri);
router.post('/savePortalApplicantsShine',portalimporter.saveApplicantsFromShine);
router.post('/savePortalApplicantsTimesJobs',portalimporter.saveApplicantsFromTimesjobsNew);
router.post('/savePortalApplicantsTotalJobs',portalimporter.saveApplicantsFromTotalJobs);
router.post('/savePortalApplicantsReed',portalimporter.saveApplicantsFromReed);
router.post('/savePortalApplicantsJobStreet',portalimporter.saveApplicantsFromJobStreet);
router.post('/savePortalApplicantsBestJobs',portalimporter.saveApplicantsFromBestJobs);
router.post('/savePortalApplicantsJobSearch',portalimporter.saveApplicantsFromJobSearch);
router.post('/savePortalApplicantsLinkedIn',portalimporter.savePortalApplicantsLinkedIn);

module.exports = router;