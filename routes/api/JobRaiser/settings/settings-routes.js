var moment=require('moment');
var express = require('express');
var router = express.Router();

var settingsCtrl = require('./settings-ctrl');

router.get('/master',settingsCtrl.getAccessrightsMaster);

router.post('/template',settingsCtrl.saveAccessrightsTemplate);
router.post('/saveoffertemplate',settingsCtrl.saveofferTemplate);

router.get('/getOfferTemplateMaster',settingsCtrl.getOfferTemplateMaster);
router.post('/saveOfferBreakUpTemplate',settingsCtrl.saveOfferBreakUpTemplate);
router.post('/offerGeneration',settingsCtrl.offerGeneration);

// router.get('/mailExtract',settingsCtrl.mailExtract);

// router.get('/imapExtract',settingsCtrl.imapExtract);

// router.get('/imapExt2',settingsCtrl.imapExt2);


router.get('/temporary',settingsCtrl.temporary);
router.get('/imapFinally',settingsCtrl.imapFinally);

router.post('/fetchOutlookMails',settingsCtrl.fetchoutLook);

module.exports = router;