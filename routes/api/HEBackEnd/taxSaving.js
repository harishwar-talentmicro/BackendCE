/**
 * Created by vedha on 26-10-2017.
 */

var express = require('express');
var router = express.Router();

var taxSaving = require('./taxSaving/taxSaving-routes');

router.use('/tax',taxSaving);

module.exports = router;

