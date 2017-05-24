/**
 * Created by vedha on 07-03-2017.
 */


var express = require('express');
var router = express.Router();

var trackTemplateCtrl = require('./trackTemplate-ctrl');

router.get('/',trackTemplateCtrl.getTrackTemplate);
router.post('/',trackTemplateCtrl.saveTrackTemplate);
router.put('/',trackTemplateCtrl.updateTrackTemplate);
router.get('/List',trackTemplateCtrl.getTrackTemplateList);
router.delete('/',trackTemplateCtrl.deleteTrackTemplate);

module.exports = router;
