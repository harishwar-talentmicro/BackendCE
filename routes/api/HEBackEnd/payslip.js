/**
 * Created by Jana1 on 08-08-2017.
 */

var express = require('express');
var router = express.Router();

var paySlipForm = require('./payslip/payslip-routes');

router.use('/',paySlipForm);

module.exports = router;