var express = require('express');
var router = express.Router();
var quickResume = require('./listing/quick-resume-routes');
router.use('/listing',quickResume);