var express = require('express');
var router = express.Router();

var quickResumeCtrl = require('./quick-resume-ctrl');

/**
 * GET Methods
 */

/**
 * Searching candidates based on email, mobile or phone number by Area Partner
 * @param req
 * @param res
 * @param next
 * @service-param q {string)
 * @method GET
 */
router.get('/resume_detail/:userId',quickResumeCtrl.getResumeDetail);

router.get('/resume_detail',quickResumeCtrl.searchCandidate);


/**
 * POST Methods
 */
router.post('/quick_resume',quickResumeCtrl.checkCandidate);

router.post('/resume_detail',quickResumeCtrl.saveResumeDetail);