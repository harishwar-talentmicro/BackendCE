/**
 * Created by Jana1 on 01-08-2017.
 */

var express = require('express');
var router = express.Router();

var meetingRoomCtrl = require('./meetingRoom-ctrl');

router.post('/meetingRoom',meetingRoomCtrl.saveMeetingRoom);
router.get('/meetingRoom',meetingRoomCtrl.getMeetingRoomList);

module.exports = router;
