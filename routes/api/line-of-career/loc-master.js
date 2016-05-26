var express = require('express');
var router = express.Router();

var loc = require('./forecast.js');
router.use('/forecast',loc);

module.exports = router;