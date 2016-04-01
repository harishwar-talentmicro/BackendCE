/**
 * Created by Hirecraft on 07-04-2016.
 */


var express = require('express');
var router = express.Router();

var association = require('./association.js');

router.use('/master',association);

module.exports = router;
