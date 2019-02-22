var moment=require('moment');
var express = require('express');
var router = express.Router();

var hrisctrl = require('./hris-ctrl');

router.get('/master',hrisctrl.masterData);
router.post('/saveEmployeeData',hrisctrl.saveEmployeeData);
router.get('/getEmployeeDetails',hrisctrl.employeeDetails);

router.get('/employeeList',hrisctrl.employeeList);

module.exports = router;