/**
 * Created by Hirecraft on 26-08-2016.
 */
var express = require('express');
var router = express.Router();
var userCtrl = require('./user-ctrl');

router.post('/signup',userCtrl.signup);
router.post('/login',userCtrl.login);
router.post('/address',userCtrl.saveAddress);
router.post('/pin',userCtrl.savePin);
router.post('/verify_mobile',userCtrl.mobileVerifyCodeGeneration);
router.get('/validate_ezeone_id/:ezeoneId',userCtrl.verifyEzeoneId);
router.get('',userCtrl.getProfileData);

router.post('',userCtrl.saveProfileData);

module.exports = router;