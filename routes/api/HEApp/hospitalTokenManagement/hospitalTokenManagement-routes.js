var express = require('express');
var router = express.Router();

var hospitalTokenManagementCtrl = require('./hospitalTokenManagement-ctrl');

router.get('/doctorsList',hospitalTokenManagementCtrl.getDoctorList); 
router.get('/doctorsDetails',hospitalTokenManagementCtrl.getDoctorDetails); 
router.get('/doctorwithVisitorList',hospitalTokenManagementCtrl.doctorDetailsWithVistorsList); 
router.post('/tokenManagement/printToken',hospitalTokenManagementCtrl.printToken);
router.get('/tokenManagement/appointmentSlots',hospitalTokenManagementCtrl.getAppointmentSlots);

router.post('/tokenManagement/bookAppointment',hospitalTokenManagementCtrl.bookAppointment);
router.post('/tokenManagement/printSpecialToken',hospitalTokenManagementCtrl.printSpecialToken);

router.post('/tokenManagement/updateStatus',hospitalTokenManagementCtrl.updateAppointmentStatus);

module.exports = router;
