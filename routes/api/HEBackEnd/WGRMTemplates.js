/**
 * Created by Jana1 on 16-01-2018.
 */


var express = require('express');
var router = express.Router();

var WGRMRoutes = require('./WGRMTemplates/WGRMTemplates-routes');

router.use('/config',WGRMRoutes);

module.exports = router;

