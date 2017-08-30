/**
 * Created by Jana1 on 08-08-2017.
 */


var express = require('express');
var router = express.Router();

var interviewStages = require('./interview/interview-routes');

router.use('/interview',interviewStages);

module.exports = router;

