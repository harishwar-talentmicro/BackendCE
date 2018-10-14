var express = require('express');
var router = express.Router();

var attendanceCtrl = require('./attendance-ctrl');

router.post('/shift',attendanceCtrl.saveAttendanceShifts);
router.post('/weekend',attendanceCtrl.saveWeekEndMaster);
router.post('/roaster',attendanceCtrl.saveroaster);

router.get('/weekDays',attendanceCtrl.getWeekDays);
router.get('/shift',attendanceCtrl.getshifts);
router.get('/weekend',attendanceCtrl.getweekend);
router.get('/roaster',attendanceCtrl.getroaster);
module.exports = router;