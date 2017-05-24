/**
 * Created by Jana1 on 19-04-2017.
 */

var express = require('express');
var router = express.Router();

var travelClaimForm = require('./travelClaim/travelClaim-routes');

router.use('/',travelClaimForm);

module.exports = router;