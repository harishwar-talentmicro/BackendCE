/**
 * Created by Jana1 on 01-10-2017.
 */


var express = require('express');
var router = express.Router();

var eventCtrl = require('./event-ctrl');

router.get('/homePageData',eventCtrl.getWhatMateBanners);
router.get('/event/homePageData',eventCtrl.getWMHomeData);
router.get('/event/agenda',eventCtrl.getWMEventAgenda);
router.get('/event/speakers',eventCtrl.getWMEventSpeakers);
router.get('/event/moderator',eventCtrl.getWMEventModerator);
router.get('/event/questions',eventCtrl.getWMEventQuestions);

module.exports = router;
