/**
 * Created by Jana1 on 25-04-2017.
 */

var express = require('express');
var router = express.Router();

var leaveTypeCtrl = require('./leave-ctrl');

router.post('/leaveType',leaveTypeCtrl.saveLeaveTypes);
router.put('/leaveType',leaveTypeCtrl.updateLeaveTypes);
router.get('/leaveType/list',leaveTypeCtrl.getLeaveTypes);
router.delete('/leaveType',leaveTypeCtrl.deleteLeaveTypes);


router.post('/leaveBalance',leaveTypeCtrl.saveLeaveBalance);
router.get('/leaveBalance/list',leaveTypeCtrl.getLeaveBalance);


module.exports = router;
