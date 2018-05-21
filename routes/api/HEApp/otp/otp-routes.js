var express = require('express');
var router = express.Router();

var otpCtrl = require('./otp-Ctrl');

router.post('/sendOtp',otpCtrl.sendOtp);
router.post('/verifyOtp',otpCtrl.toVerifyOtp);

module.exports = router;