/**
 * Created by Jana1 on 29-06-2017.
 */

var express = require('express');
var router = express.Router();

var signupCtrl = require('./signup-ctrl');

router.post('/otp',signupCtrl.sendOtp);
router.post('/verifyotp',signupCtrl.verifyOTP);
router.post('/password',signupCtrl.savePassword);

router.get('/emailId',signupCtrl.verifyEmailId);

router.get('/otp/test',signupCtrl.testOtp);
router.post('/otp/phone',signupCtrl.sendOtpPhone);

module.exports = router;