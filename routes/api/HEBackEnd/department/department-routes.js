/**
 * Created by Jana1 on 09-09-2017.
 */

var express = require('express');
var router = express.Router();

var departmentCtrl = require('./department-ctrl');

router.post('/',departmentCtrl.saveDepartment);
router.get('/list',departmentCtrl.getDepartment);
router.delete('/',departmentCtrl.deleteDepartment);

module.exports = router;