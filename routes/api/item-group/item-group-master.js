/**
 * Created by Hirecraft on 04-04-2016.
 */

var express = require('express');
var router = express.Router();

var itemGroup = require('./item-group.js');


router.use('/group',itemGroup);


module.exports = router;
