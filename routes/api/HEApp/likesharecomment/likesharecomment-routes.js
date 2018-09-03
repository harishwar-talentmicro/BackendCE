var express = require('express');
var router = express.Router();

var likesharecommentCtrl = require('./likesharecomment-Ctrl');

router.post('/LSComment/LSC',likesharecommentCtrl.saveLSComment);

router.post('/LSComment/likecommentusers',likesharecommentCtrl.getlikecommentusers);

router.get('/LSComment/commentmaster',likesharecommentCtrl.getcommentmaster);

router.post('/Archive',likesharecommentCtrl.saveArchive);

router.get('/list',likesharecommentCtrl.getArchiveTransList);

module.exports = router;