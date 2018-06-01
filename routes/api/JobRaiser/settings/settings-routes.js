var moment=require('moment');
var express = require('express');
var router = express.Router();

var settingsCtrl = require('./settings-ctrl');

router.get('/master',settingsCtrl.getAccessrightsMaster);

router.post('/template',settingsCtrl.saveAccessrightsTemplate);

module.exports = router;