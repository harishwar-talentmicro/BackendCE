/**
 * Created by vedha on 19-04-2018.
 */

var express = require('express');
var router = express.Router();

var mailReaderCtrl = require('./mailReader-ctrl');

router.get('/',mailReaderCtrl.getMails);

module.exports = router;