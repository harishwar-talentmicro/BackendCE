/**
 * Created by Jana1 on 11-03-2017.
 */

var express = require('express');
var router = express.Router();

var workLocation = require('./workLocation/workLocation-routes');

router.use('/workLocation',workLocation);

module.exports = router;

