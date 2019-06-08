var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration-ctrl');

router.post('/pacebackup',dataMigration.resumeBackUp);


module.exports = router;
