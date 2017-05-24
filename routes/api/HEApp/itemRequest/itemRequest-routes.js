/**
 * Created by Jana1 on 20-04-2017.
 */

var express = require('express');
var router = express.Router();

var itemRequestCtrl = require('./itemRequest-ctrl');

router.post('/stationary',itemRequestCtrl.saveStationaryRequest);
router.post('/pantry',itemRequestCtrl.savePantryRequest);
router.post('/asset',itemRequestCtrl.saveAssetRequest);
router.post('/docHR',itemRequestCtrl.saveDocRequestToHR);

module.exports = router;