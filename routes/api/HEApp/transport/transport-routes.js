/**
 * Created by Jana1 on 18-07-2017.
 */

var express = require('express');
var router = express.Router();

var transportCtrl = require('./transport-ctrl');

router.post('/transport',transportCtrl.saveTransportRequest);

module.exports = router;