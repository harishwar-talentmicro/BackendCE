/**
 * Created by Jana1 on 01-09-2017.
 */

var express = require('express');
var router = express.Router();

var visitorRoutes = require('./visitors/visitors-routes');

router.use('/',visitorRoutes);

module.exports = router;
