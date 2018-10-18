var express = require('express');
var router = express.Router();

var quiz = require('./quiz/quiz-routes');

router.use('/quiz',quiz);

module.exports = router;