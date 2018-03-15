/**
 * Created by vedha on 12-12-2017.
 */


var express = require('express');
var router = express.Router();

var cv = require('./cvApplicant/applicant-routes');

router.use('/cv',cv);

module.exports = router;
