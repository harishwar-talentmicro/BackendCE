/**
 * Created by Jana1 on 15-07-2017.
 */

var express = require('express');
var router = express.Router();

var HRDocCtrl = require('./HRDocuments-ctrl');

router.post('/',HRDocCtrl.saveHRDocs);
router.get('/',HRDocCtrl.getHRDocList);
router.delete('/',HRDocCtrl.deleteHRDocs);

module.exports = router;
