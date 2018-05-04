var express = require('express');
var router = express.Router();

var hospitalTokenManagementCtrl = require('./hospitalTokenManagement-ctrl');

router.get('/doctorsList',hospitalTokenManagementCtrl.getDoctorList); 
router.get('/doctorsDetails',hospitalTokenManagementCtrl.getDoctorDetails); 
router.get('/doctorwithVisitorList',hospitalTokenManagementCtrl.doctorDetailsWithVistorsList); 
router.post('/tokenManagement/printToken',hospitalTokenManagementCtrl.printToken);
router.get('/tokenManagement/appointmentSlots',hospitalTokenManagementCtrl.getAppointmentSlots);

module.exports = router;
