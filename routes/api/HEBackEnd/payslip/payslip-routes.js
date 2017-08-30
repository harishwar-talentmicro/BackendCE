/**
 * Created by Jana1 on 08-08-2017.
 */

var express = require('express');
var router = express.Router();

var payslipCtrl = require('./payslip-ctrl');

router.post('/payslip',payslipCtrl.uploadPaySlip);
router.get('/payslip',payslipCtrl.getPaySlips);

module.exports = router;
