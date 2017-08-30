/**
 * Created by Jana1 on 31-07-2017.
 */
var express = require('express');
var router = express.Router();

var supportCtrl = require('./customerSupport-ctrl');

router.post('/support',supportCtrl.saveSupportRequest);
router.post('/support/assign',supportCtrl.assignToUser);

module.exports = router;
