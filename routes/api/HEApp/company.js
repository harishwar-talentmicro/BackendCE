/**
 * Created by Jana1 on 31-08-2017.
 */


var express = require('express');
var router = express.Router();

var company = require('./company/company-routes');

router.use('/',company);

module.exports = router;