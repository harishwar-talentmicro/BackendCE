var express = require('express');
var router = express.Router();

var recruitmentSearch = require('./recruitment-search.js');

router.use('/search',recruitmentSearch);

var recruitmentNotification = require('./recruitment-notification.js');

router.use('/notification',recruitmentNotification);

module.exports = router;