var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration-ctrl');

router.post('/pacebackup',dataMigration.resumeBackUp);
router.post('/tallint_manpower_dashboard',dataMigration.tallint_manpower_dashboard);


module.exports = router;
