/**
 * Created by Jana1 on 08-08-2017.
 */

var express = require('express');
var router = express.Router();

var interviewCtrl = require('./interview-ctrl');

router.post('/stage',interviewCtrl.saveStage);
router.get('/stage',interviewCtrl.getStages);
router.delete('/stage',interviewCtrl.deleteStage);

// Assessment apis
router.post('/assessment',interviewCtrl.saveAssessment);
router.get('/assessment/list',interviewCtrl.getAssessmentList);
router.get('/assessment/detail',interviewCtrl.getAssessmentTemplateDetails);
router.delete('/assessment',interviewCtrl.deleteAssessmentTemplate);
router.delete('/assessment/question',interviewCtrl.deleteQuestion);

module.exports = router;
