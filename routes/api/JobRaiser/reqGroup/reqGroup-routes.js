var express = require('express');
var router = express.Router();

var reqGroup = require('./reqGroup-ctrl');

router.post('/saveRequirementGroup',reqGroup.saveRequirementGroup);
router.get('/getRequirementGroup',reqGroup.getRequirementGroup);
router.get('/getrequirementGroupList',reqGroup.getrequirementGroupList);
router.post('/requirementViewGroup',reqGroup.getRequirementViewGroup);

module.exports = router;
