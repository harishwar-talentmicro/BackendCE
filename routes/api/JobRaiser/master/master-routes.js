/**
 * Created by vedha on 18-12-2017.
 */

var express = require('express');
var router = express.Router();

var masterCtrl = require('./master-ctrl');

router.get('/requirement',masterCtrl.getReqMasterData);
router.get('/specialization',masterCtrl.getSpecializations);
//router.get('/eduSpec',masterCtrl.getEduSpec);  // feb 2nd 
//router.post('/eduSpecId',masterCtrl.requirementEduSpec);  // feb 6th for requirement 

//router.get('/memberList',masterCtrl.getMemberList); // not used old


router.post('/saveClients',masterCtrl.saveClients);    


router.post('/clientbranches',masterCtrl.savebranches);
router.get('/branchlist',masterCtrl.getbranchList); 

//Mail templates
router.post('/mailingTemplate',masterCtrl.savetemplate);  
router.get('/mailtemplate',masterCtrl.getmailTemplate);
router.get('/mailtemplate/detaile',masterCtrl.getmailTemplatedetaile);

router.get('/location',masterCtrl.getLocation); 
router.get('/skills',masterCtrl.getSkills);

router.get('/contactMaster',masterCtrl.getRoleLocationMasterData);

router.post('/clientLocation',masterCtrl.saveClientsBusinessLocation);

router.post('/mstageStatus',masterCtrl.saveMasterStageStatus);

router.get('/requirementView',masterCtrl.getRequirementView);
router.get('/clientView',masterCtrl.getClientView);

router.post('/tagPreview',masterCtrl.mailTags);

router.get('/stageStatusTypes',masterCtrl.getmasterStageStatusTypes);


module.exports = router;

