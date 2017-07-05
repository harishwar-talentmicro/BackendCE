/**
 * Created by vedha on 13-06-2017.
 */


var express = require('express');
var router = express.Router();

var messageCtrl = require('./sendMessage-ctrl');

router.post('/',messageCtrl.sendMessage);

module.exports = router;