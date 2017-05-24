/**
 * Created by Jana1 on 18-04-2017.
 */

var express = require('express');
var router = express.Router();

var travelRequestCtrl = require('./travelRequest-ctrl');

router.post('/',travelRequestCtrl.saveTravelRequest);

module.exports = router;