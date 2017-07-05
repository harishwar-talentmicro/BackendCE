/**
 * Created by Jana1 on 13-06-2017.
 */


var express = require('express');
var router = express.Router();

var SOSMessageCtrl = require('./sendSOSMessage-ctrl');

router.post('/',SOSMessageCtrl.sendSOSMessage);

module.exports = router;