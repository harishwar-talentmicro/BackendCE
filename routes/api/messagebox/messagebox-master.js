/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();


var message = require('./message.js');
var contact = require('./contact.js');
var group = require('./group.js');
router.use('/message',message);
router.use('/contact',contact);
router.use('/group',group);


module.exports = router;

