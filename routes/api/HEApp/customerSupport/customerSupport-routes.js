/**
 * Created by Jana1 on 31-07-2017.
 */
var express = require('express');
var router = express.Router();

var supportCtrl = require('./customerSupport-ctrl');

router.post('/support',supportCtrl.saveSupportRequest);
router.post('/support/assign',supportCtrl.assignToUser);
router.get('/supportTracker',supportCtrl.getSupportTracker);
router.get('/support/summary',supportCtrl.getSupportSummary);
router.get('/support/priorityData',supportCtrl.getSupportUsersByPriority);
router.get('/support/user',supportCtrl.getUser);

module.exports = router;
