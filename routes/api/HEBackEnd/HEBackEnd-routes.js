/**
 * Created by vedha on 17-02-2017.
 */

var express = require('express');
var router = express.Router();

var HEBackendCtrl = require('./HEBackEnd-ctrl');

router.post('',HEBackendCtrl.saveAppSettings);
router.put('',HEBackendCtrl.updateAppSettings);

router.get('',HEBackendCtrl.getAppSettings);

module.exports = router;
