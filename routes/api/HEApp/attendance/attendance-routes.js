/**
 * Created by Jana1 on 27-03-2017.
 */

var express = require('express');
var router = express.Router();

var attendanceCtrl = require('./attendance-ctrl');

router.post('/',attendanceCtrl.saveAttendance);

module.exports = router;