/**
 * Created by Jana1 on 17-04-2017.
 */

var express = require('express');
var router = express.Router();

var expenseClaimForm = require('./expenseClaim/expenseClaim-routes');

router.use('/expenseClaim',expenseClaimForm);

module.exports = router;