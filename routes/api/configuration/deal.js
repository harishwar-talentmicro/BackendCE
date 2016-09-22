/**
 * Created by Hirecraft on 24-08-2016.
 */

var express = require('express');
var router = express.Router();

var deal = require('./deal/deal-routes');

router.use('/deal',deal);

module.exports = router;
