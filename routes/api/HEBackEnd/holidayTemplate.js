/**
 * Created by Jana1 on 10-03-2017.
 */

var express = require('express');
var router = express.Router();

var holidayTemplate = require('./holidayTemplate/holidayTemplate-routes');

router.use('/holidayTemplate',holidayTemplate);

module.exports = router;

