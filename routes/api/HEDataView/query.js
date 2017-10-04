/**
 * Created by Jana1 on 30-08-2017.
 */


var express = require('express');
var router = express.Router();

var queryRoutes = require('./query/query-routes');

router.use('/',queryRoutes);

module.exports = router;
