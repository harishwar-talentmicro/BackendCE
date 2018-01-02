/**
 * Created by vedha on 12-12-2017.
 */

var express = require('express');
var router = express.Router();

var jobCtrl = require('./job-ctrl');

router.post('/defaults',jobCtrl.saveJobDefaults);
router.post('/',jobCtrl.saveJob);

router.post('/status',jobCtrl.saveJobStatus);
router.get('/status',jobCtrl.getJobStatus);

router.get('/defaultMemberList',jobCtrl.getJobDefaultMemberList);
router.get('/defaults',jobCtrl.getJobDefaults);

module.exports = router;