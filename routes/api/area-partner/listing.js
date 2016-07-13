var express = require('express');
var router = express.Router();
var quickResume = require('./listing/quick-resume-routes');
var schedule = require('./schedule/schedule-routes');
var registrationCtrl = require('./listing/register-ctrl');

router.use('/quick_resume',quickResume);
router.use('/schedule',schedule);
router.post('/register',registrationCtrl.register)



module.exports = router;