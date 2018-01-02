/**
 * Created by vedha on 18-12-2017.
 */

var express = require('express');
var router = express.Router();

var masterCtrl = require('./master-ctrl');

router.get('/requirement',masterCtrl.getReqMasterData);
router.get('/specialization',masterCtrl.getSpecilizations);
router.get('/clients',masterCtrl.getClients);
router.get('/memberList',masterCtrl.getMemberList);

module.exports = router;