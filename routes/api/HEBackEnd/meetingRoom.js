/**
 * Created by Jana1 on 01-08-2017.
 */


var express = require('express');
var router = express.Router();

var meetingRoom = require('./meetingRoom/meetingRoom-routes');

router.use('/',meetingRoom);

module.exports = router;

