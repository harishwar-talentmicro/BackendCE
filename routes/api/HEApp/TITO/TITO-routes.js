/**
 * Created by vedha on 16-05-2017.
 */


var express = require('express');
var router = express.Router();

var TITOCtrl = require('./TITO-ctrl');

router.post('/logInOut',TITOCtrl.saveAttendence);
router.post('/locationTrack',TITOCtrl.saveLocationTracking);
router.get('/attendanceRegister',TITOCtrl.getAttendanceRegister);
router.get('/attendanceRegister/details',TITOCtrl.getAttendanceRegisterDetails);

module.exports = router;

