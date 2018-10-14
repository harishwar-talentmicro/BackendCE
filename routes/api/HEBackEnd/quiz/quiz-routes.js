var express = require('express');
var router = express.Router();

var quizCtrl = require('./quiz-ctrl');

router.get('/quizList',quizCtrl.getQuizList);
router.post('/quizSaveByUsers',quizCtrl.saveQuizOfUsers);
router.post('/quizPublish',quizCtrl.quizConfigureToUsers);

router.get('/quizMaster',quizCtrl.getQuizMaster);

router.post('/saveQuizQuestion',quizCtrl.saveQuizForWebConfig);
router.post('/saveQuizTemplateWithQuestions',quizCtrl.saveQuizTemplateWithQuestions);
router.get('/quizStatusChange',quizCtrl.quizStatusChange);

router.get('/quizListWeb',quizCtrl.getQuizListWeb);

router.get('/quizNotifier',quizCtrl.notifyquiz);
router.get('/quizSummary',quizCtrl.quizQuestionReport);
router.get('/quizReportExport',quizCtrl.quizReportExport);





module.exports = router;