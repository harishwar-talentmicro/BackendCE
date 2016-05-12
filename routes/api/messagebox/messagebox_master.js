/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();

var messageBox = require('./messagebox.js');


router.use('/contacts',messageBox);

var message = require('./message.js');


router.use('/contact',message);

module.exports = router;

