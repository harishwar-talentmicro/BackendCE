/**
 * Created by Jana1 on 27-07-2017.
 */

var express = require('express');
var router = express.Router();

var salesCtrl = require('./sales-ctrl');

router.get('/sales/master',salesCtrl.getMasterData);
router.post('/sales',salesCtrl.saveSalesRequest);
router.post('/sales/assign',salesCtrl.assignToUser);

router.get('/sales/client',salesCtrl.findHECustomer);

router.post('/feedback',salesCtrl.saveSalesFeedback);
router.get('/sales/items',salesCtrl.getSalesItems);

module.exports = router;
