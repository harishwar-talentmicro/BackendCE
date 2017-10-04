/**
 * Created by Jana1 on 01-09-2017.
 */

var express = require('express');
var router = express.Router();

var customersupport = require('./customersupport/customersupport-routes');

router.use('/',customersupport);

module.exports = router;
