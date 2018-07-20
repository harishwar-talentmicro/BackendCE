var express = require('express');
var router = express.Router();

var employeeSurveyCtrl = require('./employeeSurvey-ctrl');

router.get('/surveyList',employeeSurveyCtrl.getSurveyList);

router.post('/surveyPublish',employeeSurveyCtrl.serveyConfigureToUsers);

router.post('/surveySaveByUsers',employeeSurveyCtrl.saveServeyOfUsers);

router.get('/surveyMaster',employeeSurveyCtrl.getSurveyMaster);

router.post('/saveSurveyTemplate',employeeSurveyCtrl.saveSurveyForWebConfig);

router.post('/saveSurveyTemplateWithQuestions',employeeSurveyCtrl.saveSurveyTemplateWithQuestions);

router.post('/uploadUsersfromweb',employeeSurveyCtrl.uploadUsersfromweb);

router.get('/surveyListWeb',employeeSurveyCtrl.getSurveyListWeb);

module.exports = router;




