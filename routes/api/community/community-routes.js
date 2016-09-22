/**
 * Created by Hirecraft on 19-09-2016.
 */
var express = require('express');
var router = express.Router();

var alumniCtrl = require('./community-ctrl');

router.get('/validate_community',alumniCtrl.validateCommunity);
router.get('/profile',alumniCtrl.profileDetails);
router.get('/education',alumniCtrl.education);


module.exports = router;