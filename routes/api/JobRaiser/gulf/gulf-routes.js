var moment=require('moment');
var express = require('express');
var router = express.Router();

var gulfCtrl = require('./gulf-ctrl');


router.post('/medical',gulfCtrl.saveMedical);
router.get('/medical',gulfCtrl.getMedical);

router.post('/departure',gulfCtrl.saveDeparture);
router.get('/departure',gulfCtrl.getDeparture);

router.post('/visa',gulfCtrl.saveVisa);
router.get('/visa',gulfCtrl.getVisa);

router.post('/attestation',gulfCtrl.saveAttestation);
router.get('/attestation',gulfCtrl.getAttestation);

router.post('/bill',gulfCtrl.billingFilter);

module.exports = router;