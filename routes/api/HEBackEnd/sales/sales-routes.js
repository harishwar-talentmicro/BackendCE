/**
 * Created by vedha on 25-07-2017.
 */

var express = require('express');
var router = express.Router();

var salesCtrl = require('./sales-ctrl');

router.post('/sales/item',salesCtrl.saveItems);
router.get('/sales/items',salesCtrl.getSalesItems);
router.get('/sales/item/details',salesCtrl.getSalesItemDetails);

router.post('/sales/UOM',salesCtrl.saveUOM);
router.get('/sales/UOM',salesCtrl.getUOM);
router.post('/sales/stageStatus',salesCtrl.saveStageStatus);
router.get('/sales/stageStatus',salesCtrl.getStageStatus);

router.post('/sales/member',salesCtrl.saveSalesMembers);
router.get('/sales/member',salesCtrl.getSalesMembers);

router.post('/category',salesCtrl.saveCategory);
router.get('/categories',salesCtrl.getCategory);

router.post('/support/member',salesCtrl.saveSupportMembers);
router.get('/support/member',salesCtrl.getSupportMembers);

router.post('/probabiltiy',salesCtrl.saveprobability);
router.post('/timeline',salesCtrl.savetimeline);
router.get('/probabiltiy',salesCtrl.getprobability);
router.get('/timeline',salesCtrl.gettimeline);
router.delete('/probabiltiy',salesCtrl.deleteprobability );
router.delete('/timeline',salesCtrl.deletetimeline);

router.get('/userstats',salesCtrl.getUserstats);
router.post('/report',salesCtrl.formTransaction);

module.exports = router;
