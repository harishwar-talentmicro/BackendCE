/**
 * Created by Jana1 on 27-07-2017.
 */


var express = require('express');
var router = express.Router();

var salesRoutes = require('./sales/sales-routes');

router.use('/',salesRoutes);

module.exports = router;