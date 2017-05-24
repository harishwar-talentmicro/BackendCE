/**
 * Created by Jana1 on 18-04-2017.
 */
var express = require('express');
var router = express.Router();

var requestMaster = require('./requestMaster/requestMaster-routes');

router.use('/',requestMaster);

module.exports = router;

