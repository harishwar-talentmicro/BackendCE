/**
 * Created by Jana1 on 01-09-2017.
 */

var express = require('express');
var router = express.Router();

var customerSupportCtrl = require('./customersupport-ctrl');

router.get('/customerSupport',customerSupportCtrl.getCustomerSupport);
router.get('/customerFeedback',customerSupportCtrl.getCustomerFeedback);

module.exports = router;
