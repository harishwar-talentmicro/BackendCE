/**
 * Created by vedha on 12-12-2017.
 */
var moment=require('moment');
var express = require('express');
var router = express.Router();

var jobCtrl = require('./job-ctrl');


router.post('/defaults',jobCtrl.saveJobDefaults);
router.post('/',jobCtrl.saveJob);

router.post('/status',jobCtrl.saveJobStatus);
router.get('/status',jobCtrl.getJobStatus);

router.get('/defaultMemberList',jobCtrl.getJobDefaultMemberList);
router.get('/defaults',jobCtrl.getJobDefaults); // for web
router.get('/getdefaults',jobCtrl.getdefaults); // for mobile

router.post('/contactlist',jobCtrl.getcontactlist);
router.post('/saveContact',jobCtrl.saveContact);

router.delete('/deleteContacts',jobCtrl.deleteReqContacts); // to delete req contacts
router.post('/contacts',jobCtrl.deleteMainContacts);   // on 29 jan 2018 // delete is changed to post
router.post('/branches',jobCtrl.deleteMainBranches); // 31 jan to delete branches

router.post('/saveEducation',jobCtrl.saveEducation);
router.post('/saveLocation',jobCtrl.saveLocation);

router.post('/saveRequirement',jobCtrl.saveRequirement);
router.get('/requirementDetails',jobCtrl.getRequirementDetails);

router.get('/jdTemplateList',jobCtrl.getJdTemplate);
router.get('/jdTemplateDetails',jobCtrl.getJdTemplateDetails);

router.get('/manpowerStatus',jobCtrl.manpowerRequirementStatus);
router.get('/clientManagerList',jobCtrl.getClientManagerList);

router.post('/requirementListForMobile',jobCtrl.getrequirementListMobile);
router.get('/getReqContactsForMobile',jobCtrl.getRequirementContactsOfBranchForMobile);

router.get('/columns',jobCtrl.columns);
router.post('/report',jobCtrl.dynamicReport);
module.exports = router;

