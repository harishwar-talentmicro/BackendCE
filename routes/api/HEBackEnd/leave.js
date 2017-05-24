/**
 * Created by Jana1 on 25-04-2017.
 */


var express = require('express');
var router = express.Router();

var leaveType = require('./leave/leave-routes');

router.use('/',leaveType);

module.exports = router;

