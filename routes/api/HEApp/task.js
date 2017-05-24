/**
 * Created by Jana1 on 22-03-2017.
 */

var express = require('express');
var router = express.Router();

var taskForm = require('./task/task-routes');

router.use('/task',taskForm);

module.exports = router;