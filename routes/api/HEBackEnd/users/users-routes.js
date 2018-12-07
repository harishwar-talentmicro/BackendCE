/**
 * Created by vedha on 11-03-2017.
 */

var express = require('express');
var router = express.Router();

var userCtrl = require('./users-ctrl');

router.post('/',userCtrl.saveUser);
router.get('/master_data',userCtrl.getMasterData);
router.get('/user_details',userCtrl.getUserDetails);
router.get('/user_list',userCtrl.getUserList);
router.get('/approver_list',userCtrl.getApproversList);
router.get('/receiver_list',userCtrl.getReceiversList);
router.get('/access_rights',userCtrl.getUserDataAccessRights);
router.get('/',userCtrl.searchUser);
router.get('/EZEOneId',userCtrl.validateEzeoneId);
router.post('/postToProfile',userCtrl.postToProfile);
router.post('/uploadUsersfromweb',userCtrl.uploadUsersfromweb);

router.get('/bulkImportTitle',userCtrl.bulkImporterTitleSave);  //save bulk import title,but is get api

router.get('/getBulkImportTitles',userCtrl.getBulkImporterTitles);

router.post('/updateUserDetails',userCtrl.updateMultipleUserDetails);

module.exports = router;
