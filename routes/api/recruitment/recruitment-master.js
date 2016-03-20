var express = require('express');
var router = express.Router();

var recruitmentSearch = require('./recruitment-search.js');

router.use('/search',recruitmentSearch);

module.exports = router;