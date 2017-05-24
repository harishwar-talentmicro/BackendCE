/**
 * Created by vedha on 08-03-2017.
 */

var express = require('express');
var router = express.Router();

var formType = require('./HEMasters/HEMasters-routes');

router.use('/',formType);

module.exports = router;