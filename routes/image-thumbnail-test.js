/**
 * Created by Hirecraft on 11-03-2016.
 */


/**
 *  @author Anjali Pandya
 *  @since Feb 03,2016  10:46AM
 *  @title Hris Master module
 *  @description Handles HRIS  functions
 */
"use strict";

var validator = require('validator');

var uuid = require('node-uuid');
var gcloud = require('gcloud');
var fs = require('fs');
var path = require('path');
var util = require( "util" );
var gm = require('gm').subClass({ imageMagick: true });

var appConfig = require('../ezeone-config.json');

var gcs = gcloud.storage({
    projectId: appConfig.CONSTANT.GOOGLE_PROJECT_ID,
    keyFilename: appConfig.CONSTANT.GOOGLE_KEYFILE_PATH // Location to be changed
});

// Reference an existing bucket.
var bucket = gcs.bucket(appConfig.CONSTANT.STORAGE_BUCKET);

bucket.acl.default.add({
    entity: 'allUsers',
    role: gcs.acl.READER_ROLE
}, function (err, aclObject) {
});

// method for upload image to cloud
var uploadDocumentToCloud = function(uniqueName,readStream,callback){
    var remoteWriteStream = bucket.file(uniqueName).createWriteStream();
    readStream.pipe(remoteWriteStream);

    remoteWriteStream.on('finish', function(){
        console.log('done');
        if(callback){
            if(typeof(callback)== 'function'){
                callback(null);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });

    remoteWriteStream.on('error', function(err){
        if(callback){
            if(typeof(callback)== 'function'){
                console.log(err);
                callback(err);
            }
            else{
                console.log('callback is required for uploadDocumentToCloud');
            }
        }
        else{
            console.log('callback is required for uploadDocumentToCloud');
        }
    });
};


var st = null;
function Test(db,stdLib){

    if(stdLib){
        st = stdLib;

    }
};

/**
 * @type : POST
 * @param req
 * @param res
 * @param next
 * @description Save img
 * @accepts json
 * @param pr <string> image file (multipart)
 */

Test.prototype.createThumnail = function(){

    var http = require('https');
    var fs = require('fs');
    var successList = [];
    var failedList = [];

    var count  = 0;
    var resizeAndUpload = function(resultsList){
        console.log('resultsList',resultsList);
        console.log('resultsList[count]',resultsList[count]);
        var fileName = resultsList[count].file;
        var fileSpt = fileName.split('.');
        var request = http.get("https://storage.googleapis.com/ezeone/"+fileName, function(response) {
            uploadDocumentToCloud("tn_"+fileName,gm(response).resize(128,128).quality(0).stream(fileSpt[fileSpt.length - 1]),function(err){
                if(!err){
                    console.log('File resize and upload successful');
                    successList.push(fileName);
                    if(count < (resultsList.length - 1)){
                        count += 1;
                        resizeAndUpload(resultsList);
                    }
                    else{
                        console.log('Done');
                        fs.writeFileSync('im-success.json',JSON.stringify(successList));
                        fs.writeFileSync('im-failed.json',JSON.stringify(failedList));
                    }
                }
                else{
                    failedList.push(fileName);
                    if(count < (resultsList.length - 1)){
                        count += 1;
                        resizeAndUpload(resultsList);
                    }
                    else{
                        console.log('Done');
                        fs.writeFileSync('im-success.json',JSON.stringify(successList));
                        fs.writeFileSync('im-failed.json',JSON.stringify(failedList));
                    }
                }
            });
        });
    };

    var results = [{
        file : "85b3e8da-2b50-445d-b933-09a4a57bfbd1.jpg"
    }];
    if(results.length){

        resizeAndUpload(results);
    }

    //var dbQuery = "";
    //st.db.query(dbQuery,function(err,results){
    //    if(!err){
    //        if(results){
    //            if(results[0]){
    //                if(results[0].length){
    //                    var count = 0;
    //                    resizeAndUpload(results[0]);
    //                }
    //            }
    //        }
    //    }
    //});
};

var DbHelper = require('./../helpers/DatabaseHandler'),
    db = DbHelper.getDBContext();

var StdLib = require('./modules/std-lib.js');
var stdLib = new StdLib(db);
var testMod = new Test(db,stdLib);

testMod.createThumnail();