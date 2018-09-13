/**
 * Created by vedha on 18-12-2017.
 */

var express = require('express');
var router = express.Router();

var jobPortalCtrl = require('./jobPortal-ctrl');


router.post('/applicant',jobPortalCtrl.portalSaveApplicant);
router.get('/portalApplicantMaster',jobPortalCtrl.getportalApplicantMasterData);

router.get('/portalRequirementDetails',jobPortalCtrl.getPortalRequirementDetails);
router.get('/portalRequirementList',jobPortalCtrl.getPortalRequirementList);

router.get('/portalApplicantDetails',jobPortalCtrl.getPortalApplicantDetails);

router.get('/searchJob',jobPortalCtrl.getPortalSearchJob);

router.post('/portalverifyotp',jobPortalCtrl.portalverifyotp);

router.post('/portalsignup',jobPortalCtrl.portalsignup);

router.get('/genericmaster',jobPortalCtrl.generalMasterNoToken);

router.post('/careerJobList',jobPortalCtrl.getCareerPortalRequirementList);

router.post('/reqAppMap',jobPortalCtrl.portalreqAppMap);
router.post('/jobSearch',jobPortalCtrl.portalrequirementSearch);

router.post('/portalApplicantHistory',jobPortalCtrl.portalApplicantHistory);

module.exports = router;

