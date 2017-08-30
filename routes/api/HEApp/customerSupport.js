/**
 * Created by Jana1 on 31-07-2017.
 */


var express = require('express');
var router = express.Router();

var supportRoutes = require('./customerSupport/customerSupport-routes');

router.use('/',supportRoutes);

module.exports = router;