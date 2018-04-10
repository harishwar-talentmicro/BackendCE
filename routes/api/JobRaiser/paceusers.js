
var express = require('express');
var router = express.Router();

var paceusers = require('./paceusers/paceUsers-routes');

router.use('/paceusers',paceusers);

module.exports = router;