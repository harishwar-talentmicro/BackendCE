var express = require('express');
var router = express.Router();

var walkInCV = require('./walkInCV/walkInCV-routes');

router.use('/walkInCV',walkInCV);

module.exports = router;