/**
 * Created by Jana1 on 15-06-2017.
 */


var express = require('express');
var router = express.Router();

var greetingCtrl = require('./greeting-ctrl');

router.post('/',greetingCtrl.sendGreeting);

module.exports = router;