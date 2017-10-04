/**
 * Created by Jana1 on 03-07-2017.
 */

var express = require('express');
var router = express.Router();

var managerCtrl = require('./whatmatemanager-ctrl');
router.get('/manager',managerCtrl.getUsers);
router.get('/manager/details',managerCtrl.getUserDetails);
router.post('/manager',managerCtrl.saveUsers);
router.post('/manager/APIKey',managerCtrl.resetAPIKey);

router.get('/EZEOneId',managerCtrl.validateEzeoneId);

router.get('/companies',managerCtrl.getWhatMateCompaniesList);
router.get('/dashboardInfo',managerCtrl.getFormTransactionData);
router.get('/forms',managerCtrl.getFormsNeedToSelect);

module.exports = router;