/**
 * Created by Jana1 on 24-03-2017.
 */

var express = require('express');
var router = express.Router();

var meetingCtrl = require('./meeting-ctrl');

router.post('/',meetingCtrl.saveMetting);

module.exports = router;