/**
 * Created by Hirecraft on 26-04-2016.
 */

var express = require('express');
var router = express.Router();


var message = require('./message.js');


router.use('/',message);

var contact = require('./contact.js');

router.use('/contact',contact);

var group = require('./group.js');

router.use('/group',group);

module.exports = router;

