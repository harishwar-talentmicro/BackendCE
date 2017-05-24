/**
 * Created by Jana1 on 15-03-2017.
 */


var express = require('express');
var router = express.Router();

var compose = require('./compose/compose-routes');

router.use('/',compose);

module.exports = router;