  
var express = require('express');
var router = express.Router();

var attendance = require('./attendanceRoaster/attendance-routes');

router.use('/attendance',attendance);

module.exports = router;