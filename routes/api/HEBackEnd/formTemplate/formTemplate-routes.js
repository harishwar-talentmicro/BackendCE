/**
 * Created by vedha on 06-03-2017.
 */


var express = require('express');
var router = express.Router();

var formTemplateCtrl = require('./formTemplate-ctrl');

router.get('/',formTemplateCtrl.getFormTemplate);
router.post('/',formTemplateCtrl.saveFormTemplate);
router.put('/',formTemplateCtrl.updateFormTemplate);
router.get('/List',formTemplateCtrl.getFormTemplateList);
router.delete('/',formTemplateCtrl.deleteFormTemplate);


module.exports = router;
