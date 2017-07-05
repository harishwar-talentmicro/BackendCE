/**
 * Created by Jana1 on 15-06-2017.
 */


var express = require('express');
var router = express.Router();

var commentsCtrl = require('./comments-ctrl');

router.post('/',commentsCtrl.sendGreeting);

module.exports = router;