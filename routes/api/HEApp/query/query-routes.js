/**
 * Created by Jana1 on 18-07-2017.
 */


var express = require('express');
var router = express.Router();

var queryCtrl = require('./query-ctrl');

router.post('/HR',queryCtrl.saveHRQuery);
router.post('/accounts',queryCtrl.saveAccountsQuery);
router.post('/admin',queryCtrl.saveAdminQuery);
router.post('/frontOffice',queryCtrl.saveFrontOfficeQuery);

router.get('/querytypes',queryCtrl.gtQueryTypeList);

module.exports = router ;