/**
 * Created by Jana1 on 17-04-2017.
 */

var express = require('express');
var router = express.Router();

var expenseClaimCtrl = require('./expenseClaim-ctrl');

router.post('/',expenseClaimCtrl.saveExpenseClaim);
router.get('/vault',expenseClaimCtrl.getVaultData);

module.exports = router;