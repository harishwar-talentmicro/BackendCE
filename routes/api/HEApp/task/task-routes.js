/**
 * Created by Jana1 on 22-03-2017.
 */

var express = require('express');
var router = express.Router();

var taskCtrl = require('./task-ctrl');

router.post('/',taskCtrl.saveTask);
router.get('/',taskCtrl.getTask);
router.post('/status',taskCtrl.updateTaskStatus);
router.post('/test',taskCtrl.getStationary);
// router.get('/mails',taskCtrl.getWebKey);

module.exports = router;