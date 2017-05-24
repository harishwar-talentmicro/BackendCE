/**
 * Created by Jana1 on 15-04-2017.
 */
var express = require('express');
var router = express.Router();

var expenseType = require('./expenseType/expenseType-routes');

router.use('/expenseType',expenseType);

module.exports = router;

