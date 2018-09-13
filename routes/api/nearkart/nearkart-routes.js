var express = require('express');
var router = express.Router();
var nkCtrl = require('./nearkart-ctrl');

router.get('/masterData',nkCtrl.masterData);

router.post('/sendOtp',nkCtrl.sendOtp);
router.post('/verifyOtp',nkCtrl.toVerifyOtp);

router.post('/signUp',nkCtrl.signUp);




module.exports = router;