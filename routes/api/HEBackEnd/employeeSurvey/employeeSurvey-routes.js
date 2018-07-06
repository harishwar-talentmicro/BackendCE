var express = require('express');
var router = express.Router();

var employeeSurveyCtrl = require('./employeeSurvey-ctrl');

router.get('/surveyList',employeeSurveyCtrl.getSurveyList);
module.exports = router;




