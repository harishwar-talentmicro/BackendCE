/**
 * Created by vedha on 16-05-2017.
 */

var express = require('express');
var router = express.Router();

var attendanceForm = require('./TITO/TITO-routes');

router.use('/',attendanceForm);

module.exports = router;