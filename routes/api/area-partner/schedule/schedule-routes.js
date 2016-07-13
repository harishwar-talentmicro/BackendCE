/**
 * Created by Hirecraft on 05-07-2016.
 */
var express = require('express');
var router = express.Router();

var scheduleCtrl = require('./schedule-ctrl');

router.get('/working_hours',scheduleCtrl.getWorkingHours);
router.post('/working_hours',scheduleCtrl.saveWorkingHours);

router.get('/holiday_list',scheduleCtrl.getHolidayList);
router.post('/holiday_list',scheduleCtrl.saveHolidayList);

router.get('/scheduled_tpl_list',scheduleCtrl.getTemplateList);
router.get('/scheduled_tpl_details',scheduleCtrl.getTemplateDetails);
router.post('/scheduled_tpl',scheduleCtrl.saveTemplate);
//router.get('/working_hours_tpl_list',scheduleCtrl.getWorkingHoursTplList);


module.exports = router;