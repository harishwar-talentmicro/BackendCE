/**
 * Created by Jana1 on 22-03-2017.
 */

var express = require('express');
var router = express.Router();

var taskCtrl = require('./task-ctrl');

router.post('/',taskCtrl.saveTask);

module.exports = router;