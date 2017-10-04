/**
 * Created by vedha on 27-09-2017.
 */
var express = require('express');
var router = express.Router();

var WMAdminManagerCtrl = require('./WMAdminManager-ctrl');

router.post('/',WMAdminManagerCtrl.saveWhatMate);
router.get('/list',WMAdminManagerCtrl.getWhatMateList);
router.get('/details',WMAdminManagerCtrl.getWhatMateDetails);
router.get('/ezeoneId/validate',WMAdminManagerCtrl.checkWhatMateCompany);

router.post('/homeBanner',WMAdminManagerCtrl.saveWhatMateHomeBanners);
router.get('/homeBanner/list',WMAdminManagerCtrl.getWhatMateHomeBannersList);
router.get('/homeBanner/details',WMAdminManagerCtrl.getWhatMateHomeBannerDetails);

router.get('/vault/datatype',WMAdminManagerCtrl.getVaultDataTypes);
router.post('/vault/datatype',WMAdminManagerCtrl.saveVaultDataTypes);

router.post('/vault/tag',WMAdminManagerCtrl.saveVaultTags);
router.get('/vault/tag',WMAdminManagerCtrl.getVaultTags);

module.exports = router;