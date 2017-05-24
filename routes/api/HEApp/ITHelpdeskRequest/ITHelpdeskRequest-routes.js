/**
 * Created by Jana1 on 26-04-2017.
 */



var express = require('express');
var router = express.Router();

var helpdeskCtrl = require('./ITHelpdeskRequest-ctrl');

router.post('/ITHelpdesk',helpdeskCtrl.saveHelpdesk);

module.exports = router ;