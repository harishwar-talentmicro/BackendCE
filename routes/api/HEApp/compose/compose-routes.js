/**
 * Created by Jana1 on 15-03-2017.
 */


var express = require('express');
var router = express.Router();

var composeCtrl = require('./compose-ctrl');

router.post('/send',composeCtrl.sendMessage);
router.post('/learnMessage',composeCtrl.learnMessage);

module.exports = router;
