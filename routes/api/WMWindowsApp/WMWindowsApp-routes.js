/**
 * Created by vedha on 20-12-2017.
 */

var express = require('express');
var router = express.Router();

var WMWindowsCtrl = require('./WMWindowsApp-ctrl');

router.post('/',WMWindowsCtrl.uploadPaySlip);
router.post('/file',WMWindowsCtrl.uploadPaySlipFile);

module.exports = router;