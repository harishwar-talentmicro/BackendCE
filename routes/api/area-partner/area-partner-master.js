/**
 * Created by EZEID on 7/1/2016.
 */


var express = require('express');
var router = express.Router();
var areaPartnerListing = require('./listing');
var areaPartnerATS = require('./ats');

router.use('/listing',areaPartnerListing);
router.use('/ats',areaPartnerATS);
module.exports = router;