/**
 * Created by Jana1 on 07-04-2017.
 */


var express = require('express');
var router = express.Router();

var loginForm = require('./dataview/dataview-routes');

router.use('/',loginForm);

module.exports = router;
