
var express = require('express');
var router = express.Router();

var onboardingctrl = require('./onboarding-ctrl');

router.get('/onBoardingForm',onboardingctrl.onBoardingDynamicForm);
router.get('/onBoardingMaster',onboardingctrl.onBoardingDynamicMaster);
router.post('/config',onboardingctrl.onBoardingDynamicConfig);
router.post('/onBoarding',onboardingctrl.saveOnBoarding);

router.get('/tracker',onboardingctrl.onBoardingTracker);

module.exports = router;