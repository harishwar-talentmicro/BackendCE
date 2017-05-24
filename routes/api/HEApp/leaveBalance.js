/**
 * Created by Jana1 on 04-04-2017.
 */

var express = require('express');
var router = express.Router();

var leaveBalance = require('./leaveBalance/leaveBalance-routes');

router.use('/leaveBalance',leaveBalance);

module.exports = router;