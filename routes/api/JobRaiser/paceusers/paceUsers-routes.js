var express = require('express');
var router = express.Router();

var paceUsersCtrl = require('./paceUsers-ctrl');

router.get('/checkUser',paceUsersCtrl.checkUser);
router.get('/validatePaceUser',paceUsersCtrl.paceLoginValidation);
router.get('/getUsers',paceUsersCtrl.getUsers);

router.post('/saveTask',paceUsersCtrl.saveTaskPlanner);




module.exports = router;
