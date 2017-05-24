/**
 * Created by Jana1 on 11-03-2017.
 */


var express = require('express');
var router = express.Router();

var currencyCtrl = require('./currency-ctrl');

router.post('/',currencyCtrl.saveCurrency);
router.put('/',currencyCtrl.updateCurrency);
router.get('/List',currencyCtrl.getCurrencyList);
router.delete('/',currencyCtrl.deleteCurrency);

module.exports = router;
