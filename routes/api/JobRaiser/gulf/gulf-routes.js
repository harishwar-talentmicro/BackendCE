var moment=require('moment');
var express = require('express');
var router = express.Router();

var gulfCtrl = require('./gulf-ctrl');


router.post('/medical',gulfCtrl.saveMedical);
router.get('/medical',gulfCtrl.getMedical);
module.exports = router;