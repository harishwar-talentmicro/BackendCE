/**
 * Created by Jana1 on 24-03-2017.
 */

var express = require('express');
var router = express.Router();

var masterCtrl = require('./master-ctrl');

router.get('/users',masterCtrl.searchUsers);
router.get('/expenseMasterData',masterCtrl.expenseMasterData);
router.get('/currencyList',masterCtrl.currencyData);
router.get('/stationary',masterCtrl.getStationary);
router.get('/pantry',masterCtrl.getPantryItems);
router.get('/asset',masterCtrl.getAssetsItems);
router.get('/HRDocTypes',masterCtrl.getHRDocItems);
router.get('/expenseList',masterCtrl.expenseList);
router.get('/formList',masterCtrl.getFormTypeList);

module.exports = router;