/**
 * Created by Jana1 on 14-04-2017.
 */

var express = require('express');
var router = express.Router();

var leaveLetterCtrl = require('./leaveLetter-ctrl');

router.post('/',leaveLetterCtrl.saveLeaveLetter);

module.exports = router;