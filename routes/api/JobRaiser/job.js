/**
 * Created by vedha on 12-12-2017.
 */


var express = require('express');
var router = express.Router();

var job = require('./job/job-routes');

router.use('/job',job);

module.exports = router;