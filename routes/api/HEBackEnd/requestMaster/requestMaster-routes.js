/**
 * Created by Jana1 on 18-04-2017.
 */

var express = require('express');
var router = express.Router();

var requestMasterCtrl = require('./requestMaster-ctrl');

router.post('/stationary',requestMasterCtrl.saveStationary);
router.post('/pantry',requestMasterCtrl.savePantryItem);
router.post('/assets',requestMasterCtrl.saveAssets);

router.put('/stationary',requestMasterCtrl.updateStationary);
router.put('/pantry',requestMasterCtrl.updatePantryItem);
router.put('/assets',requestMasterCtrl.updateAssets);

router.get('/stationary/list',requestMasterCtrl.getStationary);
router.get('/pantry/list',requestMasterCtrl.getPantryItem);
router.get('/assets/list',requestMasterCtrl.getAssets);

router.delete('/stationary',requestMasterCtrl.deleteStationary);
router.delete('/pantry',requestMasterCtrl.deletePantry);
router.delete('/assets',requestMasterCtrl.deleteAsset);

// router.put('/',requestMasterCtrl.updateCurrency);
// router.delete('/',requestMasterCtrl.deleteCurrency);

module.exports = router;
