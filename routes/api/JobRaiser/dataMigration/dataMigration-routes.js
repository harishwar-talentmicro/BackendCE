var express = require('express');
var router = express.Router();

var dataMigration = require('./dataMigration-ctrl');

router.post('/saveUser',dataMigration.saveUserManager);


module.exports = router;
