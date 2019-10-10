var express = require('express');
var router = express.Router();

var taskManagementCtrl = require('./task-management-ctrl');

router.post('/saveproject', taskManagementCtrl.saveproject);
router.get('/projectDetails', taskManagementCtrl.projectdetails);
router.get('/getStageList', taskManagementCtrl.getstage);
router.post('/saveticketsforcustomers', taskManagementCtrl.saveticketforcustomers);
router.get('/getticketsforcustomers', taskManagementCtrl.getticketsforcustomers);
router.get('/checkezeid', taskManagementCtrl.checkezeid);
router.post('/customermanager', taskManagementCtrl.companymanager);
router.get('/getcustomermanager', taskManagementCtrl.getcompanymanager);
router.post('/saveticketforlead', taskManagementCtrl.saveticket);
router.get('/getticketforlead', taskManagementCtrl.getticket);
router.post('/savetaskforlead', taskManagementCtrl.savetask);
router.post('/savestagestatus', taskManagementCtrl.saveStagestatus);
router.get('/getstagestatus', taskManagementCtrl.getStagestatus);
router.post('/saveticketconfig', taskManagementCtrl.saveTicketconfig);
router.get('/getticketconfig', taskManagementCtrl.getTicketconfig);
router.post('/savereasonconfig', taskManagementCtrl.saveReasonconfig);
router.get('/getreasonconfig', taskManagementCtrl.getReasonconfig);
router.get('/ticketMaster', taskManagementCtrl.ticketmaster);

router.post('/saveTicketTypes', taskManagementCtrl.saveTicketTypes);
router.post('/saveTaskTypes', taskManagementCtrl.saveTaskTypes);

module.exports = router;