
var express = require('express');
var router = express.Router();

var onboardingctrl = require('./onboarding-ctrl');

router.get('/onBoardingForm',onboardingctrl.onBoardingDynamicForm);


module.exports = router;