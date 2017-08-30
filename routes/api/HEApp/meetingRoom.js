/**
 * Created by Jana1 on 01-08-2017.
 */


var express = require('express');
var router = express.Router();

var appMeetingRoom = require('./meetingRoom/meetingRoom-routes');

router.use('/meetingRoom',appMeetingRoom);

module.exports = router;

