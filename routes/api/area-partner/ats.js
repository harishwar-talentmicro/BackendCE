/**
 * Created by Hirecraft on 04-08-2016.
 */
var express = require('express');
var router = express.Router();

var searchResume = require('./ats/search-resume-routes');

router.use('/resume',searchResume);

module.exports = router;