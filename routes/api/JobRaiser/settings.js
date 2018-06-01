var express = require('express');
var router = express.Router();

var settings = require('./settings/settings-routes');

router.use('/settings',settings);

module.exports = router;