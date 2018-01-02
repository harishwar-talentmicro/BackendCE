/**
 * Created by vedha on 24-12-2017.
 */


var express = require('express');
var router = express.Router();

var generalRequestCtrl = require('./generalRequest-ctrl');

router.post('/',generalRequestCtrl.saveGeneralRequest);
router.get('/',generalRequestCtrl.getGeneralRequest);
router.delete('/',generalRequestCtrl.deleteGeneralRequest);

module.exports = router;