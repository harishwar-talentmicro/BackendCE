var express = require('express');
var router = express.Router();

var jobPortal = require('./jobPortal/jobPortal-routes');

router.use('/jobPortal',jobPortal);

module.exports = router;
