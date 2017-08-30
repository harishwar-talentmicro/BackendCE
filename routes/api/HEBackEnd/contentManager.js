/**
 * Created by Jana1 on 07-08-2017.
 */


var express = require('express');
var router = express.Router();

var contentManager = require('./contentManager/contentManager-routes');

router.use('/contentManager',contentManager);

module.exports = router;

