/**
 * Created by vedha on 24-12-2017.
 */


var express = require('express');
var router = express.Router();

var generalRequest = require('./generalRequest/generalRequest-routes');

router.use('/generalRequest',generalRequest);

module.exports = router;


