/**
 * Created by Hirecraft on 09-08-2016.
 */


var express = require('express');
var router = express.Router();

var jobRaiserCtrl = require('./job-raiser-ctrl');

router.get('/call_notification',jobRaiserCtrl.getCallNotification);


module.exports = router;