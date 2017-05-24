/**
 * Created by Jana1 on 15-04-2017.
 */


var express = require('express');
var router = express.Router();

var expenseTypeCtrl = require('./expenseType-ctrl');

router.post('/',expenseTypeCtrl.saveExpenseType);
router.put('/',expenseTypeCtrl.updateExpenseType);
router.get('/list',expenseTypeCtrl.getExpenseTypeList);
router.delete('/',expenseTypeCtrl.deleteExpenseType);

module.exports = router;
