var express = require('express');
var router = express.Router();
var quickResume = require('./listing/quick-resume-routes');
var schedule = require('./schedule/schedule-routes');
router.use('/listing',quickResume);
router.use('/schedule',schedule);
module.exports = router;