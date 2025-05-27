/**
 * Created by Jana1 on 06-04-2017.
 */

var express = require('express');
var router = express.Router();

var loginCtrl = require('./dataview-ctrl');

router.post('/login',loginCtrl.login);
router.get('/HEUsers',loginCtrl.getHelloEZEUsers);
router.get('/task',loginCtrl.getTasks);
router.get('/meeting',loginCtrl.getMeeting);
router.get('/expense',loginCtrl.getExpenseList);

router.get('/expense/details',loginCtrl.getExpenseDetails);

router.get('/master/status',loginCtrl.getFormStatus);
router.post('/attendanceRequest',loginCtrl.getAttendanceRequestList);
router.post('/leaveRegister',loginCtrl.getLeaveRegister);
router.get('/travelRequest',loginCtrl.getTravelRequest);
router.post('/travelClaim',loginCtrl.getTravelClaim);

router.get('/sales/master',loginCtrl.getSalesMaster);
router.get('/salesTracker',loginCtrl.getSalesList);

router.post('/attendance/register',loginCtrl.getAttendanceRegister);
router.get('/attendance/register/details',loginCtrl.getAttendanceRegisterDetails);

router.get('/stationaryList',loginCtrl.getStationaryList);
router.get('/pantryList',loginCtrl.getPantryList);
router.get('/assetList',loginCtrl.getAssetList);
router.get('/manpowerList',loginCtrl.getManpowerList);
router.get('/referredCVList',loginCtrl.getReferredCVs);
router.get('/interviewScheduleList',loginCtrl.getInterviewScheduler);
router.get('/documentRequestList',loginCtrl.getDocumentRequestList);

router.get('/expense/detailReport',loginCtrl.getClaimDetails);
router.post('/expense/updateClaimData',loginCtrl.updateExpenseClaimTransactionData);

router.post('/expense/saveExpenseTypes',loginCtrl.saveExpenseTypes);
router.get('/expense/getExpenseTypes',loginCtrl.getExpenseTypes);


module.exports = router;
