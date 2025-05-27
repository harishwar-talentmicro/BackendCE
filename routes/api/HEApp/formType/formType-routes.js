/**
 * Created by Jana1 on 15-03-2017.
 */

var express = require('express');
var router = express.Router();

var formTypeCtrl = require('./formType-ctrl');

router.get('/',formTypeCtrl.getFormTypeList);
router.get('/formWiseStatusList',formTypeCtrl.formWiseStatusList);

module.exports = router;