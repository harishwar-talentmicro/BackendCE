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

router.get('/relatedDocument/find',contentManagerCtrl.findRelatedDocument);
router.get('/relatedDocuments',contentManagerCtrl.getRelatedDocument);
router.post('/relatedDocument',contentManagerCtrl.saveRelatedDocument);
router.delete('/relatedDocument',contentManagerCtrl.deleteRelatedDocument);

module.exports = router;
