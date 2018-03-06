/**
 * Created by vedha on 28-12-2017.
 */

var express = require('express');
var router = express.Router();

var zoomCtrl = require('./zoomMeeting-ctrl');

router.post('/zoom/meeting',zoomCtrl.saveZoomMeeting);
router.post('/zoom/meeting/stop',zoomCtrl.stopMeeting);
router.post('/zoom/meeting/stop/user',zoomCtrl.stopMeetingForSingleUser);
router.get('/zoom/meeting',zoomCtrl.getMeetingList);

// twilio
router.get('/twilio/accessToken',zoomCtrl.getAccessTokenVideo);
router.get('/twilio/voice/accessToken',zoomCtrl.getAccessTokenVoice);
router.post('/twilio/makeCall',zoomCtrl.makeCall);

module.exports = router;