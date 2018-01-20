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

router.get('/map/details',taxSavingsCtrl.getTaxMap);

router.post('/template',taxSavingsCtrl.saveTemplate);
router.get('/template',taxSavingsCtrl.getTemplate);

router.post('/savingMaster',taxSavingsCtrl.saveSavingsMaster);
router.get('/savingMaster',taxSavingsCtrl.getSavingsMaster);

router.delete('/group',taxSavingsCtrl.deleteTaxGroup);
router.delete('/item',taxSavingsCtrl.deleteTaxItem);
router.delete('/templateGroupMap',taxSavingsCtrl.deleteTaxTemplateGroupMap);
router.delete('/groupItemMap',taxSavingsCtrl.deleteTaxGroupItemMap);
router.delete('/savingMaster',taxSavingsCtrl.deleteSavingMaster);

router.post('/itemQuestion',taxSavingsCtrl.saveItemQuestion);
router.get('/itemQuestion',taxSavingsCtrl.getItemQuestionlist);
router.delete('/itemQuestion',taxSavingsCtrl.deleteItemQuestion);



module.exports = router;
