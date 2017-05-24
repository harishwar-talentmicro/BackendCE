/**
 * Created by vedha on 10-03-2017.
 */

var express = require('express');
var router = express.Router();

var holidayTemplateCtrl = require('./holidayTemplate-ctrl');

router.get('/',holidayTemplateCtrl.getholidayTemplateDetails);
router.post('/',holidayTemplateCtrl.saveHolidayTemplate);
router.get('/List',holidayTemplateCtrl.getholidayTemplateList);

router.delete('/',holidayTemplateCtrl.deleteHolidayTemplate);

router.delete('/holiday',holidayTemplateCtrl.deleteHoliday);

module.exports = router;
