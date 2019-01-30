var express = require('express');
var router = express.Router();

var reqGroup = require('./reqGroup/reqGroup-routes');

router.use('/reqGroup',reqGroup);

module.exports = router;