/**
 * Created by Jana1 on 14-04-2017.
 */


var express = require('express');
var router = express.Router();

var leaveLetterForm = require('./leaveLetter/leaveLetter-routes');

router.use('/leaveLetter',leaveLetterForm);

module.exports = router;