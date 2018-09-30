var express = require('express');
var router = express.Router();

var attendanceCtrl = require('./attendance-ctrl');

router.post('/shift',attendanceCtrl.saveAttendanceShifts);
router.post('/weekend',attendanceCtrl.saveWeekEndMaster);
router.post('/roaster',attendanceCtrl.saveroaster);

router.get('/weekDays',attendanceCtrl.getWeekDays);

module.exports = router;