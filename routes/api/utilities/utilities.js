var express = require('express');
var router = express.Router();

var recruitmentUtility = require('./recruitment/recruitment-utility');
var recruitmentCVGenerate = require('./recruitment/cv-temp-generate.js');

router.use('/recruitment',recruitmentUtility);
router.use('/recruitment',recruitmentCVGenerate);

module.exports = router;