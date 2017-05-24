/**
 * Created by Jana1 on 13-03-2017.
 */


var express = require('express');
var router = express.Router();

var user = require('./users/users-routes');

router.use('/user',user);

module.exports = router;

