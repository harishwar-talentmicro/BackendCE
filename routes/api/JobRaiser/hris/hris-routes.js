var moment=require('moment');
var express = require('express');
var router = express.Router();

var hrisctrl = require('./hris-ctrl');

router.get('/master',hrisctrl.masterData);
router.post('/saveEmployeeData',hrisctrl.saveEmployeeData);
router.get('/getEmployeeDetails',hrisctrl.employeeDetails);

router.post('/employeeList',hrisctrl.employeeList);
router.post('/saveEmployeeDocs',hrisctrl.SaveEmployeeDocuments);

router.post('/saveHrisDocumentTemplates',hrisctrl.saveHrisDocumentTemplates);
router.get('/getHrisDocumentTemplates',hrisctrl.getHrisDocumentTemplates);

module.exports = router;