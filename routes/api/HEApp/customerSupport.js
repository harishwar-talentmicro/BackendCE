/**
 * Created by Jana1 on 31-07-2017.
 */


var express = require('express');
var router = express.Router();

var supportRoutes = require('./customerSupport/customerSupport-routes');
var taskManagementRoutes = require('./customerSupport/task-management-routes');

router.use('/',supportRoutes);
router.use('/',taskManagementRoutes);

module.exports = router;