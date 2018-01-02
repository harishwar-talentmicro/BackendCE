/**
 * Created by vedha on 28-12-2017.
 */

var express = require('express');
var router = express.Router();

var zoomCtrl = require('./zoomMeeting-ctrl');

router.post('/zoom/meeting',zoomCtrl.saveZoomMeeting);
router.post('/zoom/meeting/stop',zoomCtrl.stopMeeting);
router.get('/zoom/meeting',zoomCtrl.getMeetingList);

module.exports = router;