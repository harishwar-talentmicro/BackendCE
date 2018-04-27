/**
 * Created by Jana1 on 08-03-2017.
 */

var express = require('express');
var router = express.Router();

var formTypeCtrl = require('./HEMasters-ctrl');

router.get('/formType',formTypeCtrl.getFormTypeList);

router.post('/workGroup',formTypeCtrl.saveWorkGroup);
router.get('/workGroup',formTypeCtrl.getWorkGroup);


router.post('/formGroup',formTypeCtrl.saveFormGroup);
router.get('/formGroup',formTypeCtrl.getFormGroupList);
router.get('/formGroup/details',formTypeCtrl.getFormGroupDetails);

router.get('/form',formTypeCtrl.getFormsNeedToSelect);

router.get('/formTemplate/workGroup',formTypeCtrl.getFormWorkList);

router.delete('/workGroup',formTypeCtrl.deleteWorkGroup);
router.delete('/formTemplateGroup',formTypeCtrl.deleteFormGroup);

router.get('/search/user',formTypeCtrl.findHEUser);

router.get('/getWebKey',formTypeCtrl.getWebKey);

module.exports = router;