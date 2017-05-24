/**
 * Created by Jana1 on 08-03-2017.
 */

var express = require('express');
var router = express.Router();

var formTypeCtrl = require('./HEMasters-ctrl');

router.get('/formType',formTypeCtrl.getFormTypeList);

router.post('/workGroup',formTypeCtrl.saveWorkGroup);
router.get('/workGroup',formTypeCtrl.getWorkGroup);

module.exports = router;