/**
 * Created by Jana1 on 11-03-2017.
 */


var express = require('express');
var router = express.Router();

var currency = require('./currency/currency-routes');

router.use('/currency',currency);

module.exports = router;

