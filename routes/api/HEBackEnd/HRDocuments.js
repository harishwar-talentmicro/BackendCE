/**
 * Created by Jana1 on 15-07-2017.
 */

var express = require('express');
var router = express.Router();

var HRDocuments = require('./HRDocuments/HRDocuments-routes');

router.use('/HRDocument',HRDocuments);

module.exports = router;

