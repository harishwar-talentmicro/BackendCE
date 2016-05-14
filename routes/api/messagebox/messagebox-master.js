/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();


var message = require('./message.js');
var contact = require('./contact.js');
var group = require('./group.js');

router.use('/contact',contact);
router.use('/group',group);
router.use('/',message);

module.exports = router;

