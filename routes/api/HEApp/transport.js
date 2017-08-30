/**
 * Created by Jana1 on 18-07-2017.
 */



var express = require('express');
var router = express.Router();

var transportForm = require('./transport/transport-routes');

router.use('/',transportForm);

module.exports = router;