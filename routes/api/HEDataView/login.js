/**
 * Created by Jana1 on 07-04-2017.
 */


var express = require('express');
var router = express.Router();

var loginForm = require('./login/login-routes');

router.use('/',loginForm);

module.exports = router;
