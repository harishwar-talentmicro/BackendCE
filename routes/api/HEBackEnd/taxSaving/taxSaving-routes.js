/**
 * Created by vedha on 26-10-2017.
 */

var express = require('express');
var router = express.Router();

var taxSavingsCtrl = require('./taxSaving-ctrl');

router.post('/group',taxSavingsCtrl.saveTaxGroup);
router.get('/group',taxSavingsCtrl.getTaxGroup);
router.post('/item',taxSavingsCtrl.saveTaxItem);
router.get('/item',taxSavingsCtrl.getTaxItem);

router.post('/templateGroupMap',taxSavingsCtrl.saveTaxTemplateGroupMap);
router.post('/groupItemMap',taxSavingsCtrl.saveTaxGroupItemMap);

module.exports = router;
