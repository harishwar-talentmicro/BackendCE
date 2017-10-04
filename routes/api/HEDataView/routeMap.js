/**
 * Created by Jana1 on 12-09-2017.
 */

var express = require('express');
var router = express.Router();

var routeMap = require('./routeMap/routeMap-routes');

router.use('/',routeMap);

module.exports = router;
