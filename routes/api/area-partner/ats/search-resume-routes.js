/**
 * Created by Hirecraft on 04-08-2016.
 */

var express = require('express');
var router = express.Router();

var searchResumeCtrl = require('./search-resume-ctrl');

router.get('/job',searchResumeCtrl.searchJob);
router.get('/job_details',searchResumeCtrl.jobDetails);


module.exports = router;