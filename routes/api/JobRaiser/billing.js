
var express = require('express');
var router = express.Router();

var billing = require('./billing/billing-routes');

router.use('/billing',billing);

module.exports = router;