var express = require('express');
var router = express.Router();
var ccavCtrl = require('./ccavenue-ctrl');


router.post('/getRSAKey',ccavCtrl.getRSAKey);
router.post('/ccavRespHandler',ccavCtrl.ccavRespDecrytAndSaveTrans);

module.exports = router;