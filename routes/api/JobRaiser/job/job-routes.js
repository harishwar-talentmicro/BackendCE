/**
 * Created by vedha on 12-12-2017.
 */
var moment=require('moment');
var express = require('express');
var router = express.Router();

var jobCtrl = require('./job-ctrl');


router.post('/defaults',jobCtrl.saveJobDefaults);
router.post('/',jobCtrl.saveJob);

router.post('/status',jobCtrl.saveJobStatus);
router.get('/status',jobCtrl.getJobStatus);

router.get('/defaultMemberList',jobCtrl.getJobDefaultMemberList);
router.get('/defaults',jobCtrl.getJobDefaults); // for web
router.get('/getdefaults',jobCtrl.getdefaults); // for mobile


// ***created by arun*****

router.get('/contactlist',jobCtrl.getcontactlist);  

router.post('/saveContact',jobCtrl.saveContact);

router.post('/saveEducation',jobCtrl.saveEducation);
module.exports = router;

