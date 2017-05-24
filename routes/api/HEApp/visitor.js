/**
 * Created by Jana1 on 27-04-2017.
 */


var express = require('express');
var router = express.Router();

var visitorForm = require('./visitor/visitor-routes');

router.use('/',visitorForm);

module.exports = router;