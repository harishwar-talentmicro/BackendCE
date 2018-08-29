var express = require('express');
var router = express.Router();

var portal = require('./portalImporter/portalImporter-routes');

router.use('/portal',portal);

module.exports = router;