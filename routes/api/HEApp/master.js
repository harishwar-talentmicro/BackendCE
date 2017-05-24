/**
 * Created by Jana1 on 24-03-2017.
 */

var express = require('express');
var router = express.Router();

var master = require('./master/master-routes');

router.use('/master',master);

module.exports = router;