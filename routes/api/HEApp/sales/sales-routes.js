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

// sales and support new module apis from here (Support is also done here)
router.post('/saveTaskForSS',salesCtrl.saveTaskForSalesSupport);
router.get('/companySearchForSaleSupport',salesCtrl.getsalesupportCompanysearch);
router.post('/getMemberListForSS',salesCtrl.getMemberListForSaleSupport);
router.post('/getContactMembers',salesCtrl.findClientContactsMember);

router.post('/getMemberListForSSWithSelectedMembers',salesCtrl.getMemberListForSaleSupportWithSelectedMembers);
router.post('/taskTrackerSS',salesCtrl.taskTrackerSaleSupport);
router.post('/saleSupportTaskList',salesCtrl.taskListSaleSupport);

router.post('/saveSaleRequestNew',salesCtrl.saveSalesRequestWithTaskNew);
router.get('/saleSupportMailerTemplateList',salesCtrl.saleSupportMailerTemplateList);
router.post('/saleSupportMailerPreview',salesCtrl.saleSupportMailerPreview);
router.post('/saleSupportSendMail',salesCtrl.saleSupportMailerSendMail);
router.post('/saleTargetPerformance',salesCtrl.salesTargetvsPerformance);
router.get('/mailTemplateMasterData',salesCtrl.mailTemplateMasterData);
router.post('/SaveMailTemplateSalesSupport',salesCtrl.SaveMailTemplateSalesSupport);
router.post('/saleSupportExpenseTracker',salesCtrl.salesSupportExpenseList);
router.get('/deleteSaleSupportTemplate',salesCtrl.deleteSaleSupportTemplate);

// submit support request new
router.post('/saveSupportRequestNew',salesCtrl.saveSupportRequestNew);
router.post('/expensetrackerAll',salesCtrl.expensetrackerAll);
router.post('/saveSalesTaxTemplate',salesCtrl.saveSalesTaxTemplate);
router.get('/getSalesTaxTemplate',salesCtrl.getSalesTaxTemplate);
router.post('/updateExpenseSS',salesCtrl.updateExpenseSS);

// web report sales and support
router.post('/salesTargetVsPerformanceSummary',salesCtrl.salesTargetVsPerformanceSummary);
router.post('/salesSummaryDetailedView',salesCtrl.salesSummaryDetailedView);
router.post('/monthlySalesView',salesCtrl.monthlySalesView);
router.post('/updateSalesTarget',salesCtrl.updatedUsersMonthlySalesTarget);

// web sales confiuration
router.post('/saveSalesConfiguration',salesCtrl.saveSalesConfiguration);
router.post('/savesalesFinanicalYears',salesCtrl.savesalesFinanicalYears);
router.get('/getSalesCOnfigurationDetails',salesCtrl.getSalesCOnfigurationDetails);

router.post('/MeetingDistanceReportSS',salesCtrl.salesSupportMeetingDistanceReport);
router.post('/updateEvent',salesCtrl.updateEventsReminder);

module.exports = router;
