var express = require('express');
var router = express.Router();

var taskManagementCtrl = require('./task-management-ctrl');

router.post('/saveproject',taskManagementCtrl.saveproject);
router.get('/projectDetails',taskManagementCtrl.projectdetails);
router.get('/getStageList',taskManagementCtrl.getstage);


module.exports = router;