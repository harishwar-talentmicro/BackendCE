/**
 * Created by Jana1 on 24-03-2017.
 */

var express = require('express');
var router = express.Router();

var meetingForm = require('./meeting/meeting-routes');

router.use('/meeting',meetingForm);

module.exports = router;