/**
 * Created by vedha on 18-12-2017.
 */

var express = require('express');
var router = express.Router();

var masterCtrl = require('./master-ctrl');

router.get('/requirement',masterCtrl.getReqMasterData);
router.get('/specialization',masterCtrl.getSpecilizations);

router.get('/memberList',masterCtrl.getMemberList);

// on hold clients
router.post('/clients',masterCtrl.saveClients);    


router.post('/clientbranches',masterCtrl.savebranches);
router.get('/branchlist',masterCtrl.getbranchList); 

//Mail templates
router.post('/template',masterCtrl.savetemplate);  
router.get('/mailtemplate',masterCtrl.getmailTemplate); 

router.get('/location',masterCtrl.getLocation); 

module.exports = router;

