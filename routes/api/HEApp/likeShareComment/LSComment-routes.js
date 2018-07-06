var express = require('express');
var router = express.Router();

var LSCommentCtrl = require('./LSComment-ctrl');

router.post('/LSC',LSCommentCtrl.saveLSComment);
module.exports = router;
