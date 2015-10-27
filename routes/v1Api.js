/**
 * Created by HireCraft on 27-10-2015.
 */

"use strict";

var express = require('express');
var router = express.Router();
var LocationManager = require('../routes/routes.js');

router.post('/st_tag',LocationManager.FnSaveStandardTags);
router.get('/st_tag',LocationManager.FnGetStandardTags);

router.post('/tag',LocationManager.FnSaveTags);
router.get('/tag',LocationManager.FnGetTags);

router.all('*',function(req,res,next){
    res.status(404).json({ status : false, error : { api : 'API'}, message : 'Not found'});
});

module.exports = router;

