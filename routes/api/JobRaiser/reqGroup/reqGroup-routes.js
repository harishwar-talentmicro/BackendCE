var express = require('express');
var router = express.Router();

var reqGroup = require('./reqGroup-ctrl');

router.post('/saveRequirementGroup',reqGroup.saveRequirementGroup);
router.get('/getRequirementGroup',reqGroup.getRequirementGroup);
router.get('/getRequirementGroupWithMaster',reqGroup.getRequirementGroupWithMaster);

router.get('/getrequirementGroupList',reqGroup.getrequirementGroupList);
router.post('/requirementViewGroup',reqGroup.getRequirementViewGroup);
router.post('/applicantViewForReqGroup',reqGroup.getreqApplicantViewWithReqGroup);
router.post('/mailerApplicantsForReqGroup',reqGroup.getMailerApplicantsForReqGroup);
router.post('/savePaceFollowUpNotesForReqGroup',reqGroup.savePaceFollowUpNotesForGroup);
router.post('/recruitersReqGroupData',reqGroup.getRecruiterPerformanceByRequirementGroup);

router.post('/clientRequirementGroups',reqGroup.getclientRequirementGroup);
router.post('/recruitersReqAppDataForReqGroup',reqGroup.getRecruiterPerformanceReqAppForRequirementGroups);

module.exports = router;
