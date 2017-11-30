/**
 * Created by Jana1 on 30-11-2017.
 */

var express = require('express');
var router = express.Router();

var travelMode = require('./travelMode/travelMode-routes');

router.use('/',travelMode);

module.exports = router;

