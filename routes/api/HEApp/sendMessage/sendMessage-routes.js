/**
 * Created by vedha on 13-06-2017.
 */


var express = require('express');
var router = express.Router();

var messageCtrl = require('./sendMessage-ctrl');

router.post('/',messageCtrl.sendMessage);
router.get('/userConfiguration',messageCtrl.getUserConfig);
router.post('/memberCount',messageCtrl.getMemberCount);

router.get('/masterData',messageCtrl.getMasterData);

router.get('/config/searchUser',messageCtrl.searchusersData);
router.get('/config/msgMapUserList',messageCtrl.GetMsgMapUsersData);
router.post('/config/msgMapData',messageCtrl.saveMsgMapUsersData);
router.delete('/config/user',messageCtrl.DeleteMsgMapUsersData);

router.get('/master/announcementTypes',messageCtrl.GetAnnouncementType);

router.get('/announcementList',messageCtrl.GetAnnouncementSummaryList);
router.get('/announcement/detailedReport',messageCtrl.GetAnnouncementDetailedSummary);

router.post('/draft',messageCtrl.saveAsDraft);
router.post('/unReadUserAnnouncements',messageCtrl.sendUnReadUsersAnnouncement);

module.exports = router;