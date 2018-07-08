var express = require('express');
var router = express.Router();

var employeeSurveyCtrl = require('./employeeSurvey-ctrl');

router.get('/surveyList',employeeSurveyCtrl.getSurveyList);

router.post('/saveSurvey',employeeSurveyCtrl.serveyConfigureToUsers);

router.post('/surveySaveByUsers',employeeSurveyCtrl.saveServeyOfUsers);

module.exports = router;




