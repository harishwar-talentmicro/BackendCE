/**
 * Created by Jana1 on 01-10-2017.
 */

var express = require('express');
var router = express.Router();

var event = require('./event/event-routes');

router.use('/event',event);

module.exports = router;

