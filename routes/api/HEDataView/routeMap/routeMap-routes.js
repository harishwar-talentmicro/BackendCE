/**
 * Created by Jana1 on 12-09-2017.
 */

var express = require('express');
var router = express.Router();

var routeMapCtrl = require('./routeMap-ctrl');

router.get('/routeMap',routeMapCtrl.getRouteMap);

module.exports = router;