/**
 * Created by Jana1 on 01-09-2017.
 */
var express = require('express');
var router = express.Router();

var visitorCtrl = require('./visitors-ctrl');
router.get('/visitorAsset',visitorCtrl.getVisitorAssetList);
router.get('/visitorGatePass',visitorCtrl.getVisitorGatePassList);
router.get('/visitorInternet',visitorCtrl.getVisitorInternetList);
router.get('/visitorHospitality',visitorCtrl.getVisitorHospitalityList);

module.exports = router;