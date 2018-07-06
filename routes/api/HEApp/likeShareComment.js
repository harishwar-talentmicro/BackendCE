var express = require('express');
var router = express.Router();

var likeShareForm = require('./LikeShareComment/LSComment-routes');

router.use('/LSComment',likeShareForm);

module.exports = router;