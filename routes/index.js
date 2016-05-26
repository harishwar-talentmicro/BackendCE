/**
 * Created by EZEID on 9/17/2015.
 */
var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var ejs = require('ejs');
var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();
var StdLib = require('./modules/std-lib.js');
var stdLib = new StdLib(db);


var maintainenceTemplate = fs.readFileSync(path.join(__dirname, '../views/maintainence.ejs'),'utf-8');
var htmlIndexFile = ejs.render(maintainenceTemplate);
var indexTemplate = '';

router.all('*',function(req,res,next){
    req.st = stdLib;
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

var User = require('./modules/user-module.js');
var userModule = new User(db,stdLib);
router.get('/:id',userModule.webLinkRedirect);

router.get('/:page',function(req,res){

    res.render(indexTemplate,{htmlContent : htmlIndexFile});

});

router.get('/',function(req,res){
    res.render(indexTemplate,{htmlContent : htmlIndexFile});
});

module.exports = router;