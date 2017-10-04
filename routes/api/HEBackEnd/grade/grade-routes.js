/**
 * Created by Jana1 on 09-09-2017.
 */

var express = require('express');
var router = express.Router();

var gradeCtrl = require('./grade-ctrl');

router.post('/',gradeCtrl.saveGrade);
router.get('/list',gradeCtrl.getGrade);
router.delete('/',gradeCtrl.deleteGrade);

module.exports = router;