
var express = require('express');
var router = express.Router();

var hospitalTokenManagementRoutes = require('./hospitalTokenManagement/hospitalTokenManagement-routes');

router.use('/',hospitalTokenManagementRoutes);

module.exports = router;

