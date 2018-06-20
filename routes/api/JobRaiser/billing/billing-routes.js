var moment=require('moment');
var express = require('express');
var router = express.Router();

var billingCtrl = require('./billing-Ctrl');

router.post('/billFilter',billingCtrl.billingFilter);

module.exports = router;
