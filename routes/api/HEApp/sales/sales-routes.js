/**
 * Created by Jana1 on 27-07-2017.
 */

var express = require('express');
var router = express.Router();

var salesCtrl = require('./sales-ctrl');

router.get('/sales/master',salesCtrl.getMasterData);
router.post('/sales',salesCtrl.saveSalesRequest);
router.post('/sales/assign',salesCtrl.assignToUser);

router.get('/sales/client',salesCtrl.findHECustomer);

router.post('/feedback',salesCtrl.saveSalesFeedback);
router.get('/sales/items',salesCtrl.getSalesItems);

router.post('/sales/tracker',salesCtrl.getSalesTracker);
router.get('/sales/summary',salesCtrl.getSalesSummary);
router.get('/sales/userPerformance/probability',salesCtrl.getSalesUserPerformanceByProbability);
router.get('/sales/userPerformance/timeLine',salesCtrl.getSalesUserPerformanceByTimeLine);

router.post('/probabiltiy',salesCtrl.saveprobability);
router.post('/timeline',salesCtrl.savetimeline);
router.get('/probabiltiy',salesCtrl.getprobability);
router.get('/timeline',salesCtrl.gettimeline);
router.delete('/probabiltiy',salesCtrl.deleteprobability );
router.delete('/timeline',salesCtrl.deletetimeline);



module.exports = router;
