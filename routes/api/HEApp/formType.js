/**
 * Created by Jana1 on 15-03-2017.
 */

var express = require('express');
var router = express.Router();

var formType = require('./formType/formType-routes');

router.use('/formType',formType);

module.exports = router;