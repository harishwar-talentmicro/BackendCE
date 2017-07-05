/**
 * Created by Jana1 on 15-06-2017.
 */


var express = require('express');
var router = express.Router();

var greeting = require('./greeting/greeting-routes');

router.use('/greeting',greeting);

module.exports = router;