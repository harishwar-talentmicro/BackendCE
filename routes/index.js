/**
 * Created by EZEID on 9/17/2015.
 */
var express = require('express');
var fs = require('fs');
var router = express.Router();
var ejs = require('ejs');

var locationManager = require('./routes.js');

var maintainenceTemplate = fs.readFileSync('../views/maintainence.ejs','utf-8');
var htmlIndexFile = ejs.render(maintainenceTemplate);
var indexTemplate = '';

router.all('*',function(req,res,next){
    try{
        var filePath = req.CONFIG.CONSTANT.INDEX_PATH;
        htmlIndexFile = fs.readFileSync(filePath);
        indexTemplate = req.CONFIG.CONSTANT.INDEX_TPL;
    }
    catch(ex){
        console.log('indexFileNotFound');
    }
    next();
});


router.get('/legal.html',function(req,res,next){
    res.render(indexTemplate,{htmlContent : htmlIndexFile});
});

router.get('/:page/:subpage/:xsubpage',function(req,res){
    res.render(indexTemplate,{htmlContent : htmlIndexFile});
});


router.get('/:page/:subpage',function(req,res){
    res.render(indexTemplate,{htmlContent : htmlIndexFile});
});

router.get('/:id',locationManager.FnWebLinkRedirect);

router.get('/:page',function(req,res){

    res.render(indexTemplate,{htmlContent : htmlIndexFile});

});

router.get('/',function(req,res){
    res.render(indexTemplate,{htmlContent : htmlIndexFile});
});

module.exports = router;