/**
 * Created by vedha on 24-11-2016.
 */


var express = require('express');
var router = express.Router();

var jobCtrl = require('./job-ctrl');

router.post('',jobCtrl.saveJob);
router.put('',jobCtrl.updateJob);

router.get('',jobCtrl.getJobList);

router.get('/jobseekers',jobCtrl.getJobseekerList);

router.put('/jobseeker/status',jobCtrl.updateJobseekerTransStatus);

router.post('/apply',jobCtrl.applyJob);

module.exports = router;