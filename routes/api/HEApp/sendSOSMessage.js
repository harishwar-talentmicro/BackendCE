/**
 * Created by Jana1 on 13-06-2017.
 */


var express = require('express');
var router = express.Router();

var sendSOSMessage = require('./sendSOSMessage/sendSOSMessage-routes');

router.use('/sendSOSMessage',sendSOSMessage);

module.exports = router;