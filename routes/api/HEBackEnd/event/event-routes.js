/**
 * Created by Jana1 on 01-10-2017.
 */

var express = require('express');
var router = express.Router();

var eventCtrl = require('./event-ctrl');

router.post('/',eventCtrl.saveEvent);
router.post('/venue',eventCtrl.saveEventVenue);
router.get('/venue',eventCtrl.getEventVenue);
router.delete('/venue',eventCtrl.deleteVenue);

router.post('/user',eventCtrl.saveEventUser);
router.get('/user',eventCtrl.getEventUser);
router.put('/user',eventCtrl.deleteEventUser);

router.post('/sponsor/category',eventCtrl.saveEventSponsorCategories);
router.get('/sponsor/category',eventCtrl.getEventSponsorCategories);
router.delete('/sponsor/category',eventCtrl.deleteSponsorCategory);

router.post('/sponsor',eventCtrl.saveEventSponsors);
router.get('/sponsor',eventCtrl.getEventSponsors);
router.delete('/sponsor',eventCtrl.deleteSponsor);

router.post('/basicInfo',eventCtrl.saveBasicEventInfo);
router.post('/advanceInfo',eventCtrl.saveAdvanceEventInfo);
router.post('/agenda',eventCtrl.saveEventAgenda);
router.delete('/agenda',eventCtrl.deleteEventAgenda);

router.get('/',eventCtrl.getEvents);
router.get('/details',eventCtrl.getEventDetails);
router.get('/agenda',eventCtrl.getEventAgendaList);

module.exports = router;