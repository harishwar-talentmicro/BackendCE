/**
 * Created by Jana1 on 01-08-2017.
 */

var express = require('express');
var router = express.Router();

var recruitmentForm = require('./recruitment/recruitment-routes');

router.use('/',recruitmentForm);

module.exports = router;