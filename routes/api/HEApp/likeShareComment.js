
var express = require('express');
var router = express.Router();

var likesharecomment = require('./likesharecomment/likesharecomment-routes');

router.use('/',likesharecomment);

module.exports = router;