var express = require('express');
var router = express.Router();

var recruitmentUtility = require('./recruitment/recruitment-utility');

router.use('/recruitment',recruitmentUtility);

module.exports = router;