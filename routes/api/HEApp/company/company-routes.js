/**
 * Created by Jana1 on 31-08-2017.
 */


var express = require('express');
var router = express.Router();

var companyCtrl = require('./company-ctrl');

router.get('/company/search',companyCtrl.searchComapny);
router.get('/company/masters',companyCtrl.getComapnyMasters);
router.post('/company/join',companyCtrl.joinComapny);

router.get('/media/icons',companyCtrl.getSocialMediaLinks);

module.exports = router;