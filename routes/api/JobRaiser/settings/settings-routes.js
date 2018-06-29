var moment=require('moment');
var express = require('express');
var router = express.Router();

var settingsCtrl = require('./settings-ctrl');

router.get('/master',settingsCtrl.getAccessrightsMaster);

router.post('/template',settingsCtrl.saveAccessrightsTemplate);

router.get('/mailExtract',settingsCtrl.mailExtract);

router.get('/imapExtract',settingsCtrl.imapExtract);


module.exports = router;