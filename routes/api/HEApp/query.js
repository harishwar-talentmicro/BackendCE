/**
 * Created by Jana1 on 18-07-2017.
 */



var express = require('express');
var router = express.Router();

var queryRoutes = require('./query/query-routes');

router.use('/query',queryRoutes);

module.exports = router;