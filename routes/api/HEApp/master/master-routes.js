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

router.get('/workGroups',masterCtrl.getWorkGroup);
router.get('/companies',masterCtrl.getWhatMateCompaniesList);

router.get('/company/config',masterCtrl.getCompanyConfig);
router.post('/whatmateTransactionList',masterCtrl.whatmateTransactionList);
router.post('/whatmateBulkTransUpdate',masterCtrl.whatmateBulkTransUpdate);

module.exports = router;