/**
 * Created by Hirecraft on 24-08-2016.
 */


var express = require('express');
var router = express.Router();

var dealCtrl = require('./deal-ctrl');

router.get('/',dealCtrl.getDeal);
router.post('/',dealCtrl.saveDeal);


module.exports = router;
