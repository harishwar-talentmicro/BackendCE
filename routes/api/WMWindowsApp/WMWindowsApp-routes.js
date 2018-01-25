/**
 * Created by vedha on 20-12-2017.
 */

var express = require('express');
var router = express.Router();

var WMWindowsCtrl = require('./WMWindowsApp-ctrl');

router.post('/',WMWindowsCtrl.uploadPaySlip);
router.post('/form16',WMWindowsCtrl.uploadForm16);

router.post('/file',WMWindowsCtrl.uploadPaySlipFile);
router.post('/taxDeclaration',WMWindowsCtrl.uploadTaxDeclaration);

module.exports = router;