/**
 * Created by vedha on 06-03-2017.
 */

var express = require('express');
var router = express.Router();

var formTemplate = require('./formTemplate/formTemplate-routes');

router.use('/formTemplate',formTemplate);

module.exports = router;
