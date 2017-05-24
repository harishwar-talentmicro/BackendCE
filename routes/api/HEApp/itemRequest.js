/**
 * Created by Jana1 on 20-04-2017.
 */

var express = require('express');
var router = express.Router();

var stationaryForm = require('./itemRequest/itemRequest-routes');

router.use('/',stationaryForm);

module.exports = router;