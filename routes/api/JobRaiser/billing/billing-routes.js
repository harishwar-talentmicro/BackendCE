var moment=require('moment');
var express = require('express');
var router = express.Router();

var billingCtrl = require('./billing-Ctrl');

router.post('/billFilter',billingCtrl.billingFilter);  
router.post('/billTaxTemplate',billingCtrl.billTaxTemplate);

router.get('/billingMaster',billingCtrl.billmasterTaxTypes);

router.post('/invoiceTemplate',billingCtrl.billInvoiceTemplate);

router.post('/invoicePreview',billingCtrl.invoiceMailerPreview);

module.exports = router;
