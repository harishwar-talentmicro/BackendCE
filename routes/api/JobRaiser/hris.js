var express = require('express');
var router = express.Router();

var hris = require('./hris/hris-routes');

router.use('/hris',hris);

module.exports = router;