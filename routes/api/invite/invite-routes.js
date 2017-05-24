/**
 * Created by Jana1 on 01-02-2017.
 */


var express = require('express');
var router = express.Router();

var inviteCtrl = require('./invite-ctrl');

router.post('',inviteCtrl.invite);

module.exports = router;