var moment = require('moment');
var express = require('express');
var router = express.Router();

var portalimporter = require('./portalimporter-Ctrl');
var monsterUSImporter = require('./monsterus')
var founditImporter = require('./foundit')
var LinkedInimporter = require('./linkedIn');
var ziprecruiterImporter = require('./ziprecruiter');
var naukriImporter = require('./naukri');
var shineImporter = require('./shine');
var IIMImporter = require('./iim-jobs');
var ApnaJobsImporter = require('./apnajobs');
var BaytImporter = require('./bayt');
var careerBuilderImporter = require('./careerbuilder');


// router.get('/vc', visitingCardImporter.visitingCardDesignOne);

// var timesJobImporter = require('./timesJob');

router.post('/checkPortalApplicantsMonster', portalimporter.checkApplicantExistsFromMonsterPortal);
router.post('/checkPortalApplicantsMonsterUS', monsterUSImporter.checkApplicantExistsFromMonsterPortal);
router.post('/checkPortalApplicantsFoundIt', founditImporter.checkApplicantExistsFromFoundITPortal);
router.post('/checkPortalApplicantsNaukri', naukriImporter.checkApplicantExistsFromNaukriPortal);
router.post('/checkPortalApplicantsNaukriRMS', naukriImporter.checkApplicantExistsFromNaukriPortalRMS);
router.post('/checkPortalApplicantsNaukriApplied', naukriImporter.checkApplicantExistsFromNaukriPortalApplied);
router.post('/checkPortalApplicantsShine', shineImporter.checkApplicantExistsFromShinePortalNew);
// router.post('/checkPortalApplicantsTimesJobs', timesJobImporter.checkApplicantExistsFromTimesJobsPortalNew);
router.post('/checkPortalApplicantsTotalJobs', portalimporter.checkApplicantExistsFromTotalJobsPortal);
router.post('/checkPortalApplicantsReed', portalimporter.checkApplicantExistsFromReed);
router.post('/checkPortalApplicantsJobStreet', portalimporter.checkApplicantExistsFromJobStreetPortal);
router.post('/checkPortalApplicantsBestJobs', portalimporter.checkApplicantExistsFromBestJobsPortal);
router.post('/checkPortalApplicantsJobSearch', portalimporter.checkApplicantExistsFromJobSearchPortal);
router.post('/checkPortalApplicantsFreshersWorld', portalimporter.checkApplicantExistsFromFreshersWorldPortal);
router.post('/checkPortalApplicantsJobCentral', portalimporter.checkApplicantExistsFromJobCentral);
router.post('/checkPortalApplicantsZipRecruiter', ziprecruiterImporter.checkApplicantExistsFromZipRecruiter);
router.post('/checkPortalApplicantsLinkedIn', LinkedInimporter.checkApplicantsLinkedIn);
router.post('/checkPortalApplicantsLinkedInRecruiter', LinkedInimporter.checkApplicantExistsFromLinkedInRecruiter);
router.post('/checkPortalApplicantsIIMJobs', IIMImporter.checkApplicantExistsFromIIMJobs);
router.post('/checkPortalApplicantsApnaJobs', ApnaJobsImporter.checkApplicantExistsFromApnaJobs);
router.post('/checkPortalApplicantsBayt', BaytImporter.checkApplicantExistsFromBayt);




router.post('/savePortalApplicantsMonster', portalimporter.saveApplicantsFromMonster);
router.post('/savePortalApplicantsMonsterUS', monsterUSImporter.saveApplicantsFromMonster);
router.post('/savePortalApplicantsFoundIt', founditImporter.saveApplicantsFromFoundIT);
router.post('/savePortalApplicantsNaukri', naukriImporter.saveApplicantsFromNaukri);
router.post('/savePortalApplicantsNaukriRMS', naukriImporter.saveApplicantsFromNaukriRMS);
router.post('/savePortalApplicantsNaukriApplied', naukriImporter.saveApplicantsFromNaukriApplied);
router.post('/savePortalApplicantsShine', shineImporter.saveApplicantsFromShineNew);
// router.post('/savePortalApplicantsTimesJobs', timesJobImporter.saveApplicantsFromTimesjobsNew);
router.post('/savePortalApplicantsTotalJobs', portalimporter.saveApplicantsFromTotalJobs);
router.post('/savePortalApplicantsReed', portalimporter.saveApplicantsFromReed);
router.post('/savePortalApplicantsJobStreet', portalimporter.saveApplicantsFromJobStreet);
router.post('/savePortalApplicantsBestJobs', portalimporter.saveApplicantsFromBestJobs);
router.post('/savePortalApplicantsJobSearch', portalimporter.saveApplicantsFromJobSearch);
router.post('/savePortalApplicantsLinkedIn', LinkedInimporter.savePortalApplicantsLinkedIn);
router.post('/savePortalApplicantsLinkedInRecruiter', LinkedInimporter.savePortalApplicantsLinkedInRecruiter);
router.post('/savePortalApplicantsFreshersWorld', portalimporter.saveApplicantsFromFreshersWorld);
router.post('/checkApplicantForPacehcm', portalimporter.checkApplicantForPacehcm);
router.post('/saveApplicantForPacehcm', portalimporter.saveApplicantForPacehcm);
router.post('/saveApplicantForJobCentral', portalimporter.saveApplicantJobCentral);
router.post('/saveApplicantForZipRecruiter', ziprecruiterImporter.saveApplicantForZipRecruiter);
router.post('/saveApplicantForIIMJobs', IIMImporter.saveApplicantForIIMJobs);
router.post('/saveApplicantForApnaJobs', ApnaJobsImporter.saveApplicantForApnaJobs);
router.post('/saveApplicantForBayt', BaytImporter.saveApplicantForBayt);
router.post('/saveApplicantForCareerbuilderApplied', careerBuilderImporter.saveApplicantsFromCareerBuilderApplied);

module.exports = router;