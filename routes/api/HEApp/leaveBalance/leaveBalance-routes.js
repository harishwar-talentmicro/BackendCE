/**
 * Created by Jana1 on 04-04-2017.
 */

var express = require('express');
var router = express.Router();

var leaveBalanceCtrl = require('./leaveBalance-ctrl');
router.get('/form',leaveBalanceCtrl.getLeaveBalanceForm);
router.get('/',leaveBalanceCtrl.getLeaveBalance);

router.get('/applications',leaveBalanceCtrl.getLeaveApplications);

module.exports = router;
