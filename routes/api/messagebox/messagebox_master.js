/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();

var messageBox = require('./messagebox.js');


router.use('/contact',messageBox);


module.exports = router;

