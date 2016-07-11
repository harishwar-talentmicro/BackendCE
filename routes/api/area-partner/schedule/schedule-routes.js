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

router.get('/holiday_tpl_list',scheduleCtrl.getHolidayTplList);
router.get('/holiday_tpl_details',scheduleCtrl.getHolidayTplDtl);
//router.get('/working_hours_tpl_list',scheduleCtrl.getWorkingHoursTplList);


module.exports = router;