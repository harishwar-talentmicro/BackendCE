/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();

var batch = require('./batch.js');


router.use('/process',batch);

var billBatch = require('./bill-batch.js');


router.use('/bill',billBatch);

module.exports = router;

