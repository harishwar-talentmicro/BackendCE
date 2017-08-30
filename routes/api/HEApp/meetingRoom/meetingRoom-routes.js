/**
 * Created by Jana1 on 01-08-2017.
 */


var express = require('express');
var router = express.Router();

var appMeetingRoomCtrl = require('./meetingRoom-ctrl');


router.get('/',appMeetingRoomCtrl.getMeetingRooms);
router.get('/master',appMeetingRoomCtrl.getMasterData);
router.post('/',appMeetingRoomCtrl.bookMeetingRoom);

module.exports = router;
