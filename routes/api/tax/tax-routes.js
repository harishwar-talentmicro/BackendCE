/**
 * Created by vedha on 17-10-2017.
 */

var express = require('express');
var router = express.Router();

var taxCtrl = require('./tax-ctrl');

router.get('/tax/declarations',taxCtrl.getTaxDeclarations);
router.post('/tax/item',taxCtrl.saveTaxItems);
router.get('/tax/item',taxCtrl.getTaxItems);
router.delete('/tax/item',taxCtrl.deleteTaxItems);
router.post('/tax/plannedAmount',taxCtrl.saveTaxGroupPlannedAmount);
router.get('/tax/questions',taxCtrl.getTaxItemQuestions);
router.post('/tax/questions',taxCtrl.saveTaxItemQuestions);

module.exports = router;