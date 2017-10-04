/**
 * Created by Jana1 on 09-09-2017.
 */

var express = require('express');
var router = express.Router();

var department = require('./department/department-routes');

router.use('/department',department);

module.exports = router;

