/**
 * Created by Jana1 on 26-04-2017.
 */


var express = require('express');
var router = express.Router();

var helpdesk = require('./ITHelpdeskRequest/ITHelpdeskRequest-routes');

router.use('/',helpdesk);

module.exports = router;