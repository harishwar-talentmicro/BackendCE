var express = require('express');
var router = express.Router();

var gulf = require('./gulf/gulf-routes');

router.use('/gulf',gulf);

module.exports = router;