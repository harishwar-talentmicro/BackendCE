/**
 * Created by EZEID on 7/1/2016.
 */


var express = require('express');
var router = express.Router();
var areaPartnerListing = require('./listing');

router.use('/listing',areaPartnerListing);
module.exports = router;