/**
 * Created by Jana1 on 09-09-2017.
 */

var express = require('express');
var router = express.Router();

var grade = require('./grade/grade-routes');

router.use('/grade',grade);

module.exports = router;

