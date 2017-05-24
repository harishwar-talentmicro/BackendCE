/**
 * Created by Jana1 on 27-03-2017.
 */

var express = require('express');
var router = express.Router();

var attendanceForm = require('./attendance/attendance-routes');

router.use('/attendance',attendanceForm);

module.exports = router;