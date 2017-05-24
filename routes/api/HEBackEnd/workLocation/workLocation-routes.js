/**
 * Created by Jana1 on 10-03-2017.
 */

var express = require('express');
var router = express.Router();

var workLocationCtrl = require('./workLocation-ctrl');

router.get('/',workLocationCtrl.getWorkLocationDetails);
router.post('/',workLocationCtrl.saveWorkLocation);
router.put('/',workLocationCtrl.updateWorkLocation);
router.get('/List',workLocationCtrl.getWorkLocationList);
router.delete('/',workLocationCtrl.deleteWorkLocation);

module.exports = router;
