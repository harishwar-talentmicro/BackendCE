var moment=require('moment');
var express = require('express');
var router = express.Router();

var portalimporter = require('./portalimporter-Ctrl');

router.post('/checkPortalApplicantsMonster',portalimporter.checkApplicantExistsFromPortal);



module.exports = router;