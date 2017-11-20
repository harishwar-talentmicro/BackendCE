/**
 * Created by Jana1 on 06-11-2017.
 */

var express = require('express');
var router = express.Router();

var policeStationRoutes = require('./police/police-routes');

router.use('/police',policeStationRoutes);

module.exports = router;