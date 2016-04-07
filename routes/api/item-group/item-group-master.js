/**
 * Created by Hirecraft on 04-04-2016.
 */

var express = require('express');
var router = express.Router();

var itemGroup = require('./item-group.js');
var itemMaster = require('./item-master.js');

router.use('/group',itemGroup);
router.use('/master',itemMaster);

module.exports = router;
