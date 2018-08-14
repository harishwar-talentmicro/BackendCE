var moment=require('moment');
var express = require('express');
var router = express.Router();

var settingsCtrl = require('./settings-ctrl');

router.get('/master',settingsCtrl.getAccessrightsMaster);

router.post('/template',settingsCtrl.saveAccessrightsTemplate);

// router.get('/mailExtract',settingsCtrl.mailExtract);

// router.get('/imapExtract',settingsCtrl.imapExtract);

// router.get('/imapExt2',settingsCtrl.imapExt2);


router.get('/temporary',settingsCtrl.temporary);

module.exports = router;