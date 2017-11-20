/**
 * Created by Jana1 on 06-11-2017.
 */


var express = require('express');
var router = express.Router();

var policeStationCtrl = require('./police-ctrl');

router.get('/stations',policeStationCtrl.getPoliceStations);
router.post('/incident',policeStationCtrl.saveIncident);
router.get('/incidents',policeStationCtrl.getIncident);

router.get('/map',policeStationCtrl.getMapPoliceStations);

router.get('/about',policeStationCtrl.getPoliceAbout);

router.post('/public/notification',policeStationCtrl.savePublicNotification);

module.exports = router;
