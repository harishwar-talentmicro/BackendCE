var moment=require('moment');
var express = require('express');
var router = express.Router();

var settingsCtrl = require('./settings-ctrl');

router.get('/master',settingsCtrl.getAccessrightsMaster);

router.post('/template',settingsCtrl.saveAccessrightsTemplate);
router.post('/saveoffertemplate',settingsCtrl.saveofferTemplate);

router.get('/getOfferTemplateMaster',settingsCtrl.getOfferTemplateMaster);
router.post('/saveOfferBreakUpTemplate',settingsCtrl.saveOfferBreakUpTemplate);
<<<<<<< HEAD
=======
router.post('/offerGeneration',settingsCtrl.offerGeneration);
>>>>>>> 9028c96f411c82a158ea85e480c1c564861889ef

// router.get('/mailExtract',settingsCtrl.mailExtract);

// router.get('/imapExtract',settingsCtrl.imapExtract);

// router.get('/imapExt2',settingsCtrl.imapExt2);


router.get('/temporary',settingsCtrl.temporary);
router.get('/imapFinally',settingsCtrl.imapFinally);

router.post('/fetchOutlookMails',settingsCtrl.fetchoutLook);

module.exports = router;