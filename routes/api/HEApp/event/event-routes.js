/**
 * Created by Jana1 on 01-10-2017.
 */


var express = require('express');
var router = express.Router();

var eventCtrl = require('./event-ctrl');

router.get('/homePageData',eventCtrl.getWhatMateBanners);
router.get('/event/homePageData',eventCtrl.getWMHomeData);
router.get('/event/agenda',eventCtrl.getWMEventAgenda);
router.get('/event/agenda/details',eventCtrl.getWMEventAgendaDetails);

router.get('/event/speakers',eventCtrl.getWMEventSpeakers);
router.get('/event/moderator',eventCtrl.getWMEventModerator);
router.get('/event/questions',eventCtrl.getWMEventQuestions);
router.post('/event/question/reply',eventCtrl.updateReplyStatus);

router.post('/event/question',eventCtrl.saveEventQuestions);
router.post('/event/question/answer',eventCtrl.saveEventAnswer);
router.post('/event/question/changeStatus',eventCtrl.changeQuestionStatus);

router.get('/event/users',eventCtrl.getWMEventUsers);
router.post('/event/user/changeStatus',eventCtrl.changeUserStatus);

router.post('/event/message',eventCtrl.saveEventMessage);
router.get('/event/messages',eventCtrl.getEventMessage);

router.post('/event/sendMessage',eventCtrl.sendEventMessage);
router.get('/event/messageLog',eventCtrl.getEventMessageLog);

router.delete('/event/message',eventCtrl.deleteEventMessage);

router.post('/event/agenda/feedback',eventCtrl.saveSessionFeedback);
router.get('/join/search',eventCtrl.getJoinSearch);
router.get('/home/search/details',eventCtrl.getStatusOfWMList);

router.post('/event/join',eventCtrl.joinEvent);
router.post('/event/selfCheckIn',eventCtrl.selfCheckIn);

router.get('/event/speaker/details',eventCtrl.getWMEventSpeakerDetails);

router.post('/event/feedback/notification',eventCtrl.saveFeedbackMessage);

router.get('/event/feedback/notification',eventCtrl.getFeedbackMessage);

module.exports = router;
