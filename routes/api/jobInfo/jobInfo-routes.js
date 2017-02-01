/**
 * Created by vedha on 06-01-2017.
 */

var express = require('express');
var router = express.Router();

var jobInfoCtrl = require('./jobInfo-ctrl');

router.post('',jobInfoCtrl.saveJobInfo);
router.get('',jobInfoCtrl.getJobInfo);


module.exports = router;

