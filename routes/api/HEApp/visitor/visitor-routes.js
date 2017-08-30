/**
 * Created by Jana1 on 27-04-2017.
 */


var express = require('express');
var router = express.Router();

var visitorCtrl = require('./visitor-ctrl');

router.post('/visitorGatePass',visitorCtrl.saveGatePassRequest);
router.get('/visitor/list',visitorCtrl.getVisitorList);
router.post('/visitorAssetPass',visitorCtrl.saveGateAssetPassRequest);

router.get('/visitor/search',visitorCtrl.searchVisitors);

router.post('/guestHospitality',visitorCtrl.saveGuestHospitalityRequest);

router.post('/visitorInternet',visitorCtrl.saveInternetRequest);

module.exports = router;