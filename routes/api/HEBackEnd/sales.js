/**
 * Created by Jana1 on 25-07-2017.
 */

var express = require('express');
var router = express.Router();

var sales = require('./sales/sales-routes');

router.use('/',sales);

module.exports = router;

