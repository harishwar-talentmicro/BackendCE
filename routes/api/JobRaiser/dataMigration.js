var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration/dataMigration-routes');

router.use('/',dataMigration);

module.exports = router;