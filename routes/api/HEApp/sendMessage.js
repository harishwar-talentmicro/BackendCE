/**
 * Created by Jana1 on 13-06-2017.
 */



var express = require('express');
var router = express.Router();

var sendMessage = require('./sendMessage/sendMessage-routes');

router.use('/sendMessage',sendMessage);

module.exports = router;