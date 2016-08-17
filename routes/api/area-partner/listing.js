var express = require('express');
var router = express.Router();
var quickResume = require('./listing/quick-resume-routes');
var schedule = require('./schedule/schedule-routes');
var registrationCtrl = require('./listing/register-ctrl');
var masterCtrl = require('./listing/master-ctrl');
var searchResume = require('./ats/search-resume-routes');

router.use('/quick_resume',quickResume);
router.use('/schedule',schedule);
router.use('/resume',searchResume);
router.post('/register',registrationCtrl.register);
router.get('/master',masterCtrl.getMasterDetail);
//router.get('/lat_long',masterCtrl.getLatLong);



module.exports = router;