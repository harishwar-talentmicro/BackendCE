/**
 * Created by Jana1 on 30-08-2017.
 */
var express = require('express');
var router = express.Router();

var queryCtrl = require('./query-ctrl');

router.get('/query/HR',queryCtrl.getHRQueryList);
router.get('/query/finance',queryCtrl.getFinanceQueryList);
router.get('/query/admin',queryCtrl.getAdminQueryList);
router.get('/query/frontOffice',queryCtrl.getFrontOfficeQueryList);
router.get('/query/ITHelpDesk',queryCtrl.getITHelpDeskList);
router.get('/messages',queryCtrl.getMessagesList);
router.get('/contacts',queryCtrl.getContactUs);
router.get('/transportRequest',queryCtrl.getTransportRequest);

module.exports = router;