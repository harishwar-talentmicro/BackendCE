/**
 * Created by vedha on 30-11-2017.
 */

var express = require('express');
var router = express.Router();

var travelModeCtrl = require('./travelMode-ctrl');

router.post('/travelMode',travelModeCtrl.saveTravelMode);
router.get('/travelMode',travelModeCtrl.getTravelMode);
router.delete('/travelMode',travelModeCtrl.deleteTravelMode);

module.exports = router;
