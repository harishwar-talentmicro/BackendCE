/**
 * Created by Jana1 on 07-08-2017.
 */

var express = require('express');
var router = express.Router();

var contentManagerCtrl = require('./contentManager-ctrl');

router.post('/',contentManagerCtrl.saveContent);
router.get('/',contentManagerCtrl.findDocument);
router.get('/details',contentManagerCtrl.getDocumentDetails);
router.delete('/',contentManagerCtrl.deleteDoc);

module.exports = router;
