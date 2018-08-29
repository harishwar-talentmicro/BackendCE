var moment=require('moment');
var express = require('express');
var router = express.Router();

var portalimporter = require('./portalimporter-Ctrl');

router.post('/checkPortalApplicantsMonster',portalimporter.checkApplicantExistsFromMonsterPortal);

router.post('/savePortalApplicantsMonster',portalimporter.saveApplicantsFromMonster);

router.post('/checkPortalApplicantsNaukri',portalimporter.checkApplicantExistsFromNaukriPortal);

router.post('/savePortalApplicantsNaukri',portalimporter.saveApplicantsFromNaukri);

module.exports = router;