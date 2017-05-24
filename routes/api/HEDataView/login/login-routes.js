/**
 * Created by Jana1 on 06-04-2017.
 */

var express = require('express');
var router = express.Router();

var loginCtrl = require('./login-ctrl');

router.post('/login',loginCtrl.login);
router.get('/HEUsers',loginCtrl.getHelloEZEUsers);
router.get('/task',loginCtrl.getTasks);

module.exports = router;
