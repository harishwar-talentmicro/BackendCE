
var express = require('express');
var router = express.Router();

var SurveyForm = require('./employeeSurvey/employeeSurvey-routes');

router.use('/employeeSurvey',SurveyForm);

module.exports = router;