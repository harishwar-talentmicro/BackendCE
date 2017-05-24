/**
 * Created by Jana1 on 18-04-2017.
 */


var express = require('express');
var router = express.Router();

var travelRequestForm = require('./travelRequest/travelRequest-routes');

router.use('/travelRequest',travelRequestForm);

module.exports = router;