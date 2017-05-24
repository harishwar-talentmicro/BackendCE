/**
 * Created by vedha on 07-03-2017.
 */


var express = require('express');
var router = express.Router();

var trackTemplate = require('./trackTemplate/trackTemplate-routes');

router.use('/trackTemplate',trackTemplate);

module.exports = router;

