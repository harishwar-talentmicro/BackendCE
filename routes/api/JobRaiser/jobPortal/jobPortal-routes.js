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

module.exports = router;

