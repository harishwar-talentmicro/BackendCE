/**
 * Created by Jana1 on 19-04-2017.
 */


var express = require('express');
var router = express.Router();

var travelClaimCtrl = require('./travelClaim-ctrl');

router.post('/travelClaim',travelClaimCtrl.saveTravelClaim);

router.get('/travelClaim/travelRequest',travelClaimCtrl.getTravelRequest);

module.exports = router;