/**
 * Created by Jana1 on 16-01-2018.
 */

var express = require('express');
var router = express.Router();

var WGRMTemplateCtrl = require('./WGRMTemplates-ctrl');

router.post('/WG',WGRMTemplateCtrl.saveWGTemplate);
router.post('/RM',WGRMTemplateCtrl.saveRMTemplate);
router.get('/WGlist',WGRMTemplateCtrl.getWGTemplate);
router.get('/RMlist',WGRMTemplateCtrl.getRMTemplate);
router.get('/WGdetailes',WGRMTemplateCtrl.getWGTemplatedetailes);
router.get('/RMdetailes',WGRMTemplateCtrl.getRMTemplatedetailes);
router.delete('/WGdetailes',WGRMTemplateCtrl.deleteWGTemplatedetailes);
router.delete('/RMdetailes',WGRMTemplateCtrl.deleteRMTemplatedetailes);
router.get('/RMID',WGRMTemplateCtrl.getRMTemplatemaster);


module.exports = router;

